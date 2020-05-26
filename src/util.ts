import * as vscode from 'vscode';
import * as fs from 'fs';
import * as commandExists from 'command-exists';
import { debugMode } from './consts';

export enum LogLevel {
    info,
    warning,
    error
};

export const getBinPath = () => {
    const config = getConfiguration();
    return config.general.pathToLilypond;
};

export const logger = (msg: string, logLevel: LogLevel, mute: boolean = false) => {
    const getLogger = () => {
        switch (logLevel) {
            case LogLevel.info:
                return mute ? (debugMode ? console.log : () => undefined) : vscode.window.showInformationMessage;
            case LogLevel.warning:
                return mute ? (debugMode ? console.warn : () => undefined) : vscode.window.showWarningMessage;
            case LogLevel.error:
                return mute ? (debugMode ? console.error : () => undefined) : vscode.window.showErrorMessage;
        }
    };
    getLogger()(msg);
};

/// check whether `lilypond` is available
export const lilypondExists = (): boolean => {
    const binPath = getBinPath();

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

/// wrapper to get the workspace folder from a document if provided
export const getConfiguration = (doc: vscode.TextDocument | undefined = undefined) => {
    /// if a doc is provided use its workspace folder    
    if (doc) {
        return vscode.workspace.getConfiguration(`vslilypond`, doc);
    }
    /// if not, try the active text editor
    if (vscode.window.activeTextEditor) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
        if (workspaceFolder) {
            return vscode.workspace.getConfiguration(`vslilypond`, workspaceFolder);
        }
    }
    /// try the root workspace folder if present
    if (vscode.workspace.workspaceFolders?.length) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        return vscode.workspace.getConfiguration(`vslilypond`, workspaceFolder);
    }
    return vscode.workspace.getConfiguration(`vslilypond`);
};

export const errMsgRegex = new RegExp([
    `([^\\n\\r]+):`,      // Absolute file path
    `(\\d+):(\\d+):`,     // Line and column
    ` (error|warning):`,  // Message type
    ` ([^\\n\\r]+)`       // Message
].join(``), `gm`);
