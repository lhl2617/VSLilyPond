import * as vscode from 'vscode';
import { binPath } from './consts';
import * as fs from 'fs';
import * as commandExists from 'command-exists';

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

/// check whether `lilypond` is available
export const lilypondExists = (): boolean => {
    const exists = commandExists.sync(binPath);

    return exists;
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

export const notUndefined = <T>(x: T | undefined): x is T => {
    return x !== undefined;
};
