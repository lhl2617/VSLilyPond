import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration(`vslilypond`);

export const binPath = config.general.pathToLilypond;

export const langId = `lilypond`;