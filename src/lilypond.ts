import * as cp from 'child_process';
import * as vscode from 'vscode';
import { logger, LogLevel } from './util';
import { binName, langId } from './consts';
import * as path from 'path';

export enum CompileMode {
    onSave, // compile on save
    onCompile // compile on command
};

type CompilerProcessType = {
    compileMode: CompileMode,
    process: cp.ChildProcessWithoutNullStreams,
};

let compileProcess: CompilerProcessType | undefined = undefined;

/// compile
export const compile = async (
    compileMode = CompileMode.onCompile,
    mute: boolean = false,
    textDocument: vscode.TextDocument | undefined = undefined,
    timeout: number = 10000
) => {
    try {
        if (compileProcess) {
            if (compileProcess.compileMode === CompileMode.onCompile && compileMode === CompileMode.onSave) {
                /// currently running compile process is onCompile and the current caller is onSave
                /// return and do nothing
                return;
            }
            compileProcess.process.kill();
            compileProcess = undefined;
        }
        const config = vscode.workspace.getConfiguration(`vslilypond`);

        const activeTextDocument = textDocument ?? vscode.window.activeTextEditor?.document;
        if (!activeTextDocument) { throw new Error(`No active text editor open`); }

        const docLangId = activeTextDocument.languageId;
        if (docLangId !== langId) { throw new Error(`Only Lilypond files are supported`); }

        const filePath = activeTextDocument.uri.fsPath;

        const formatArg = `--${config.compilation.outputFormat}`;
        const additionalArgs: string[] = config.compilation.additionalCommandLineArguments.trim().split(/\s+/);

        const args = [`-s`, formatArg].concat(additionalArgs).concat(filePath);

        logger(`Compiling...`, LogLevel.info, mute);
        compileProcess = {
            compileMode: compileMode,
            process: cp.spawn(binName, args, { cwd: path.dirname(filePath), timeout: timeout })
        };

        compileProcess.process.stdout.on('data', (data) => {
            logger(`stdout: ${data}`, LogLevel.info, true);
        });

        compileProcess.process.stderr.on('data', (data) => {
            logger(`Compilation Error: ${data}`, LogLevel.error, mute);
        });

        compileProcess.process.on('close', (code) => {
            logger(`Compilation process exited with code ${code}`, LogLevel.info, true);
            if (code === 0) {
                logger(`Compiled successfully`, LogLevel.info, mute);
            }
            else {
                logger(`Compilation failed`, LogLevel.error, mute);
            }
            compileProcess = undefined;
        });
    }
    catch (err) {
        logger(err.message, LogLevel.error, mute);
    }
};
