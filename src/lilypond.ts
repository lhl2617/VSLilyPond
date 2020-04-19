import * as cp from 'child_process';
import * as vscode from 'vscode';
import { getWorkspacePath, logger, LogLevel } from './util';
import { binName, langId } from './consts';

/// compile
export const compile = (mute: boolean = false, textDocument: vscode.TextDocument | undefined = undefined, timeout: number = 10000): void => {
    try {
        const config = vscode.workspace.getConfiguration(`vslilypond`);

        const workspacePath = getWorkspacePath();
        if (!workspacePath) { throw new Error(`Cannot get workspace folder path`); }

        const activeTextDocument = textDocument ?? vscode.window.activeTextEditor?.document;
        if (!activeTextDocument) { throw new Error(`No active text editor open`); }

        const docLangId = activeTextDocument.languageId;
        if (docLangId !== langId) { throw new Error(`Only Lilypond files are supported`); }

        const filePath = activeTextDocument.uri.fsPath;

        const formatArg = `--${config.compilation.outputFormat}`;
        const additionalArgs: string[] = config.compilation.additionalCommandLineArguments.trim().split(/\s+/);

        const args = [`-s`, formatArg].concat(additionalArgs).concat(filePath);

        vscode.window.setStatusBarMessage(`Compiling...`);
        const s = cp.spawn(binName, args, { cwd: workspacePath, timeout: timeout });

        s.stdout.on('data', (data) => {
            logger(`stdout: ${data}`, LogLevel.info, true);
        });

        s.stderr.on('data', (data) => {
            logger(`Compilation Error: ${data}`, LogLevel.error, mute);
        });

        s.on('close', (code) => {
            logger(`Compilation process exited with code ${code}`, LogLevel.info, true);
            if (code === 0) {
                logger(`Compiled successfully`, LogLevel.info, mute);
            }
            vscode.window.setStatusBarMessage(``);
        });
    }
    catch (err) {
        logger(err.message, LogLevel.error, mute);
    }
};
