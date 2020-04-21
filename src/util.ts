import * as vscode from 'vscode';
import * as cp from 'child_process';
import { binName } from './consts';
import * as fs from 'fs';

export enum LogLevel {
    info,
    warning,
    error
};

export const logger = (msg: string, logLevel: LogLevel, mute: boolean = false) => {
    const getLogger = () => {
        switch (logLevel) {
            case LogLevel.info:
                return mute ? console.log : vscode.window.showInformationMessage;
            case LogLevel.warning:
                return mute ? console.warn : vscode.window.showWarningMessage;
            case LogLevel.error:
                return mute ? console.error : vscode.window.showErrorMessage;
        }
    };
    getLogger()(msg);
};

export const getWorkspacePath = () => {
    const folders = vscode.workspace.workspaceFolders ?? [];
    if (folders.length === 1) {
        return folders[0].uri.fsPath;
    }
    else {
        vscode.window.showErrorMessage(`LilyPond++ only supports 1 project folder.`);
    }
    return undefined;
};


/// check whether `lilypond` is available
export const lilypondExists = (): boolean => {
    try {
        cp.execSync(`${binName} -v`);
    }
    catch (err) {
        return false; // does not exist
    }
    return true;
};

/// ensure directory exists before writing file
export const ensureDirectoryExists = (dirName: string) => {
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }
};

export const stripFileExtension = (fileName: string): string => {
	return fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
};