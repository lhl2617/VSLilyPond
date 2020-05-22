import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { logger, LogLevel } from './util';
import { langId, binPath } from './consts';

// 1.1.11: Overhauled script based on
// https://github.com/nwhetsell/linter-lilypond/blob/master/lib/linter-lilypond.coffee


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

const triggerIntellisense = async (doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection) => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    timeout = setTimeout(() => execIntellisense(doc, diagCol), 500);
};

export type DiagnosticInfo = {
    uri: vscode.Uri;
    range: vscode.Range;
    severity: vscode.DiagnosticSeverity;
    errMsg: string;
};

const errMsgRegex = new RegExp([
    `([^:\\n\\r]+):`,     // File path: this might not work for networked locations with :
    `(\\d+):(\\d+):`,     // Line and column
    ` (error|warning):`,  // Message type
    ` ([^\\n\\r]+)`       // Message
].join(``), `gm`);


const getDiagSeverity = (s: string): vscode.DiagnosticSeverity => {
    switch (s) {
        case `error`:
            return vscode.DiagnosticSeverity.Error;
        case `warning`:
            return vscode.DiagnosticSeverity.Warning;
        default:
            return vscode.DiagnosticSeverity.Error;
    }
};

const indexOfRegex = (s: string, regexp: RegExp) => {
    // console.log(s);
    // console.log(regexp);
    const m = s.match(regexp);
    return m ? s.indexOf(m[0]) : -1;
};

const addToDiagCol = (diag: DiagnosticInfo, diagCol: vscode.DiagnosticCollection) => {
    const { uri, severity, range, errMsg } = diag;
    const diagnostic: vscode.Diagnostic =
    {
        severity: severity,
        range: range,
        message: errMsg,
    };
    const currentDiags = diagCol.get(uri) ?? [];

    const newDiags = currentDiags.concat(diagnostic);

    diagCol.set(uri, newDiags);
};

/// redline the \include directive
/// relative path is the actual string used
const processIncludeError = async (doc: vscode.TextDocument, relativePath: string, diag: DiagnosticInfo) => {
    const regexedRelativePath = relativePath.replace(/[|\\{}()[\]^$+*?.]/g, '\\\\$&');
    console.log(regexedRelativePath)
    const regexp = new RegExp(`\\include[\\s+]"${regexedRelativePath}"`)
    console.log(JSON.stringify(regexp));
    const index = indexOfRegex(doc.getText(), regexp);
    console.log(index);

    if (index >= 0) {
        const { severity, errMsg } = diag;
        const pos = doc.positionAt(index);
        const newDiag: DiagnosticInfo = {
            uri: doc.uri,
            range: new vscode.Range(pos, new vscode.Position(pos.line + 1, 0)),
            severity: severity,
            errMsg: errMsg
        }; 
        return newDiag;
    }
};

const processIntellisenseErrors = async (output: string, doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection) => {
    let errGroup: RegExpExecArray | null = null;
    while (errGroup = errMsgRegex.exec(output)) {
        outputToChannel(`REE: ${JSON.stringify(errGroup)}`);
        try {
            const uri = doc.uri;
            const lineNo = Number.parseInt(errGroup[2], 10) - 1;
            const charNo = Number.parseInt(errGroup[3], 10) - 1;
            const severity = getDiagSeverity(errGroup[4]);
            const errMsg = errGroup[5];

            const diag: DiagnosticInfo = {
                uri: uri,
                severity: severity,
                range: new vscode.Range(lineNo, 0, lineNo, charNo),
                errMsg: errMsg,
            };

            /// need to differentiate between included file and local
            if (errGroup[1] === `-`) {
                addToDiagCol(diag, diagCol);
            }
            else {
                const includeDiag = await processIncludeError(doc, errGroup[1], diag);
                console.log(JSON.stringify(includeDiag))
                if (includeDiag) {
                    addToDiagCol(includeDiag, diagCol);
                }
            }

        }
        catch (err) {
            logger(`processIntellisenseErrors error: ${err.message}`, LogLevel.error, true);
        }
    }
};

const execIntellisense = async (doc: vscode.TextDocument, diagCol: vscode.DiagnosticCollection) => {
    try {
        diagCol.clear();
        
        const config = vscode.workspace.getConfiguration(`vslilypond`);

        const additionalArgs: string[] = config.intellisense.additionalCommandLineArguments.trim().split(/\s+/);

        const intellisenseArgs = [
            `-s`,                               /// silent mode
            `--define-default=backend=null`,    /// to not output printed score 
            `-`                                 /// read input from stdin
        ];

        const args = additionalArgs.concat(intellisenseArgs);

        if (intellisenseProcess) {
            intellisenseProcess.kill();
            intellisenseProcess = undefined;
        }

        intellisenseProcess = cp.spawn(binPath, args, { cwd: path.dirname(doc.uri.fsPath) });

        intellisenseProcess.stdin.write(doc.getText());

        intellisenseProcess.stdin.end();

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
    catch (err) {
        const errMsg = `Intellisense failed with error ${err.message}`;
        logger(errMsg, LogLevel.error, true);
        outputToChannel(errMsg, true);
    }
};

export const subscribeIntellisense = (context: vscode.ExtensionContext, diagCol: vscode.DiagnosticCollection) => {
    initIntellisense();
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === langId) {
        triggerIntellisense(vscode.window.activeTextEditor.document, diagCol);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === langId) {
                triggerIntellisense(editor.document, diagCol);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.languageId === langId) { triggerIntellisense(e.document, diagCol); }
        }));

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => diagCol.delete(doc.uri))
    );
};