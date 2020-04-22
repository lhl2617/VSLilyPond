import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as lodash from 'lodash';
import { ensureDirectoryExists, logger, LogLevel } from './util';
import { langId, binName } from './consts';

// INTELLISENSE
let timeout: any = undefined;
const triggerIntellisense = (doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection, context: vscode.ExtensionContext) => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    timeout = setTimeout(() => execIntellisense(doc, diagCol, context), 500);
};

const processIntellisenseErrors = (output: string, doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection) => {
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

    const processErrorGroup = (errGroup: string[]): vscode.Diagnostic | undefined => {
        const errStr = errGroup[0].match(/[0-9]+:[0-9]+/);
        if (errStr && errStr.length && errStr[0].length) {
            const errLine = errStr[0];
            const split = errLine.split(`:`);
            const lineNo = parseInt(split[0]) - 1;
            const charNo = parseInt(split[1]);

            /// strip away filepath and line info
            errGroup[0] = errGroup[0].substr(errGroup[0].indexOf(errLine) + errLine.length + 2);
            const fullErr = errGroup.join(`\n`);

            const diagnostic: vscode.Diagnostic =
            {
                severity: vscode.DiagnosticSeverity.Error,
                range: new vscode.Range(lineNo, 0, lineNo, charNo),
                message: fullErr,
            };
            return diagnostic;
        }
        return undefined;
    };

    // @ts-ignore
    const gottenDiag: vscode.Diagnostic[] =
        errorGroups
            .map(errGroup => processErrorGroup(errGroup))
            .filter(x => x !== undefined);
    const currentDiag = diagCol.get(doc.uri) ?? [];

    const diagnostics = currentDiag.concat(gottenDiag);
    diagCol.set(doc.uri, diagnostics);
};

const execIntellisense = (doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection, context: vscode.ExtensionContext) => {
    diagCol.clear();

    const tmpPath = context.storagePath ?? "lilypondTmp";

    /// ensure this dir exists
    ensureDirectoryExists(tmpPath);

    const tmpFilePath = path.join(tmpPath, 'intellisenseTmp.txt');

    const config = vscode.workspace.getConfiguration(`vslilypond`);

    fs.writeFile(tmpFilePath, doc.getText(), (err) => {
        if (err) {
            logger(err.message, LogLevel.error, true);
        }

        const additionalArgs: string[] = config.intellisense.additionalCommandLineArguments.trim().split(/\s+/);

        /// to include the current directory of the file as a search path
        const includeArg = `--include=${path.dirname(doc.uri.fsPath)}`;

        const args = [`-s`].concat(additionalArgs).concat(includeArg).concat(tmpFilePath);

        const s = cp.spawn(binName, args, { cwd: tmpPath });

        s.stdout.on('data', (data) => {
            logger(`Intellisense: no errors, ${data}`, LogLevel.info, true);
        });

        s.stderr.on('data', (data) => {
            processIntellisenseErrors(data.toString(), doc, diagCol);
        });

        s.on('close', (code) => {
            logger(`Intellisense process exited with code ${code}`, LogLevel.info, true);
        });

    });
};

export const subscribeIntellisense = (context: vscode.ExtensionContext, diagCol: vscode.DiagnosticCollection) => {
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