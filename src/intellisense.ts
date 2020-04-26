import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { ensureDirectoryExists, logger, LogLevel, notUndefined } from './util';
import { langId, binName } from './consts';


// INTELLISENSE

/// make ready an output channel
let intellisenseOutputChannel: vscode.OutputChannel | undefined = undefined;
const initIntellisense = () => {
    intellisenseOutputChannel = vscode.window.createOutputChannel(`VSLilyPond: Intellisense`);
};

const outputToChannel = async (msg: string, show: boolean = false) => {
    if (intellisenseOutputChannel) {
        intellisenseOutputChannel.appendLine(msg);
        if (show) {
            intellisenseOutputChannel.show(true);
        }
    }
    else {
        logger(`Unable to output to Intellisense OutputChannel, ${msg}`, LogLevel.warning, true);
    }
};

let intellisenseProcess: cp.ChildProcessWithoutNullStreams | undefined = undefined;
let timeout: any = undefined;

const triggerIntellisense = async (doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection, context: vscode.ExtensionContext) => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    timeout = setTimeout(() => execIntellisense(doc, diagCol, context), 500);
};

export type DiagErrorInfo = {
    error: string,
    lineNo: number,
    charNo: number
};

/// group errors
export const groupErrors = (output: string): string[][] => {
    const errorLines = output.split(`\n`);
    let errorGroups: string[][] = [];
    let currErrGroup: string[] = [];

    /// group the errors
    for (let i = 0; i < errorLines.length; ++i) {
        const line = errorLines[i];
        const errStr = line.match(/[0-9]+:[0-9]+/);

        if (errStr && errStr.length && errStr[0].length) {
            if (currErrGroup.length) {
                errorGroups.push(currErrGroup);
                currErrGroup = [];
            }
            currErrGroup.push(line);
        }
        else {
            /// only push if there is an error /[0-9]+:[0-9]+/
            if (currErrGroup.length) {
                currErrGroup.push(line);
            }
        }
    }
    if (currErrGroup.length) {
        errorGroups.push(currErrGroup);
        currErrGroup = [];
    }
    return errorGroups;
};

export const getDiagError = (errGroup: string[]): DiagErrorInfo => {
    if (errGroup.length === 0) {
        throw new Error(`Error group is empty!`);
    }
    const errStr = errGroup[0].match(/[0-9]+:[0-9]+/);
    if (!errStr || !errStr.length || !(errStr[0].length)) {
        throw new Error(`Error group does not match lineNo:charNo format!`);
    }
    const errLine = errStr[0];
    const split = errLine.split(`:`);
    const lineNo = parseInt(split[0]) - 1;
    const charNo = parseInt(split[1]);

    /// strip away filepath and line info
    errGroup[0] = errGroup[0].substr(errGroup[0].indexOf(errLine) + errLine.length + 2);
    const fullErr = errGroup.join(`\n`);

    return {
        error: fullErr,
        lineNo: lineNo,
        charNo: charNo
    };
};

const processIntellisenseErrors = async (output: string, doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection) => {
    const errorGroups = groupErrors(output);
    const processErrorGroup = (errGroup: string[]): vscode.Diagnostic | undefined => {
        try {
            const diagErr = getDiagError(errGroup);
            const { lineNo, charNo, error } = diagErr;

            const diagnostic: vscode.Diagnostic =
            {
                severity: vscode.DiagnosticSeverity.Error,
                range: new vscode.Range(lineNo, 0, lineNo, charNo),
                message: error,
            };
            return diagnostic;
        }
        catch (err) {
            logger(err.message, LogLevel.warning, true);
            return undefined;
        }
    };

    const gottenDiag: vscode.Diagnostic[] =
        errorGroups
            .map(processErrorGroup)
            .filter(notUndefined);

    const currentDiag = diagCol.get(doc.uri) ?? [];

    const diagnostics = currentDiag.concat(gottenDiag);
    diagCol.set(doc.uri, diagnostics);
};

const execIntellisense = async (doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection, context: vscode.ExtensionContext) => {
    try {
        diagCol.clear();

        /// storagePath may be undefined if the workspace is not active
        const tmpPath = context.storagePath ?? context.globalStoragePath;
    
        /// ensure this dir exists
        ensureDirectoryExists(tmpPath);
    
        const tmpFilePath = path.join(tmpPath, 'intellisenseTmp.txt');
    
        const config = vscode.workspace.getConfiguration(`vslilypond`);
    
        fs.writeFile(tmpFilePath, doc.getText(), (err) => {
            if (err) {
                /// mute here because it is just intellisense
                logger(err.message, LogLevel.error, true);
            }
            else {
                const additionalArgs: string[] = config.intellisense.additionalCommandLineArguments.trim().split(/\s+/);
    
                /// to include the current directory of the file as a search path
                const includeArg = `--include=${path.dirname(doc.uri.fsPath)}`;
    
                const args = [`-s`].concat(additionalArgs).concat(includeArg).concat(tmpFilePath);
    
                if (intellisenseProcess) {
                    intellisenseProcess.kill();
                    intellisenseProcess = undefined;
                }
    
                intellisenseProcess = cp.spawn(binName, args, { cwd: tmpPath });
    
                intellisenseProcess.stdout.on('data', (data) => {
                    logger(`Intellisense: no errors, ${data}`, LogLevel.info, true);
                });
    
                intellisenseProcess.stderr.on('data', (data) => {
                    processIntellisenseErrors(data.toString(), doc, diagCol);
                });
    
                intellisenseProcess.on('close', (code) => {
                    logger(`Intellisense process exited with code ${code}`, LogLevel.info, true);
                    intellisenseProcess = undefined;
                });
            }
        });
    }
    catch (err) {
        const errMsg = `Intellisense failed with error ${err.message}`;
        logger(errMsg, LogLevel.error, true);
        outputToChannel(errMsg, true);
    }
};

export const subscribeIntellisense = (context: vscode.ExtensionContext, diagCol: vscode.DiagnosticCollection) => {
    initIntellisense();
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === langId) {
        triggerIntellisense(vscode.window.activeTextEditor.document, diagCol, context);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === langId) {
                triggerIntellisense(editor.document, diagCol, context);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.languageId === langId) { triggerIntellisense(e.document, diagCol, context); }
        }));

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => diagCol.delete(doc.uri))
    );
};