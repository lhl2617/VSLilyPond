import * as cp from 'child_process';
import * as vscode from 'vscode';
import { logger, LogLevel } from './util';
import { binPath, langId } from './consts';
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

/// make ready an output channel
let compileOutputChannel: vscode.OutputChannel | undefined = undefined;
export const initCompile = () => {
    compileOutputChannel = vscode.window.createOutputChannel(`VSLilyPond: Compilation`);
};

const outputToChannel = async (msg: string, show: boolean = false) => {
    if (compileOutputChannel) {
        compileOutputChannel.appendLine(msg);
        if (show) {
            compileOutputChannel.show(true);
        }
    }
    else {
        logger(`Unable to output to Compile OutputChannel, ${msg}`, LogLevel.warning, true);
    }
};

/// compile
export const compile = async (
    compileMode = CompileMode.onCompile,
    mute: boolean = false,
    textDocument: vscode.TextDocument | undefined = undefined,
    timeout: number = 0
) => {
    try {
        if (compileProcess) {
            /// basically, onSave compile cannot override onCompile compile
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

        if (compileMode === CompileMode.onSave) {
            outputToChannel(`[SAVED]: ${filePath}`);
        }
        outputToChannel(`Compiling...`);
        logger(`Compiling...`, LogLevel.info, mute);
        compileProcess = {
            compileMode: compileMode,
            process: cp.spawn(binPath, args, { cwd: path.dirname(filePath) })
        };

        compileProcess.process.stdout.on('data', (data) => {
            logger(`stdout: ${data}`, LogLevel.info, true);
        });

        compileProcess.process.stderr.on('data', (data) => {
            logger(`Compilation Error: ${data}`, LogLevel.error, mute);
            outputToChannel(`Compilation Error: ${data}`, true);
        });

        compileProcess.process.on('close', (code) => {
            logger(`Compilation process exited with code ${code}`, LogLevel.info, true);
            if (code === 0) {
                logger(`Compilation successful`, LogLevel.info, mute);
                outputToChannel(`Compilation successful`);
            }
            else {
                logger(`Compilation failed`, LogLevel.error, mute);
                outputToChannel(`Compilation failed`, true);
            }
            compileProcess = undefined;
        });
    }
    catch (err) {
        logger(err.message, LogLevel.error, mute);
        outputToChannel(`Compilation failed with: ${err.message}`, true);
    }
};
