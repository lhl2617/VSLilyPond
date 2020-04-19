import * as vscode from 'vscode';
import { lilypondExists } from './util';
import { compile } from './lilypond';
import { subscribeIntellisense } from './intellisense';
import { playMIDI } from './midi';

export function activate(context: vscode.ExtensionContext) {
	/// need to make sure `lilypond` exists in PATH variable, otherwise throw an error and exit
	if (!lilypondExists()) {
		vscode.window.showErrorMessage(`\`lilypond\` is not found in your system. Please make sure it is installed and in your PATH variables.`);
		return;
	}

	/// compile to pdf
	const compileCmd = vscode.commands.registerCommand('extension.compile', () => {
		compile();
	});
	context.subscriptions.push(compileCmd);


	/// play midi
	const playMidiCmd = vscode.commands.registerCommand('extension.playMIDI', () => {
		playMIDI();
	});
	context.subscriptions.push(playMidiCmd);

	/// stop midi 
	const stopMidiCmd = vscode.commands.registerCommand('extension.stopMIDI', () => {
		vscode.window.showInformationMessage('stop midi!');
	});
	context.subscriptions.push(stopMidiCmd);


	/// compile upon saving
    vscode.workspace.onDidSaveTextDocument((textDoc: vscode.TextDocument) => {
        compile(true, textDoc, 1000);
    });

	/// intellisense
	const diagnosticCollection = vscode.languages.createDiagnosticCollection();
	subscribeIntellisense(context, diagnosticCollection);

}

// this method is called when your extension is deactivated
export function deactivate() { }
