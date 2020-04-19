import * as vscode from 'vscode';
import { lilypondExists } from './util';
import { compile } from './lilypond';
import { subscribeIntellisense } from './intellisense';
import { playMIDI, stopMIDI, pauseMIDI, resumeMIDI, resetMIDI } from './midi';

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
		stopMIDI();
	});
	context.subscriptions.push(stopMidiCmd);

	/// pause midi 
	const pauseMidiCmd = vscode.commands.registerCommand('extension.pauseMIDI', () => {
		pauseMIDI();
	});
	context.subscriptions.push(pauseMidiCmd);

	/// resume midi 
	const resumeMidiCmd = vscode.commands.registerCommand('extension.resumeMIDI', () => {
		resumeMIDI();
	});
	context.subscriptions.push(resumeMidiCmd);

	/// reset midi 
	const resetMidiCmd = vscode.commands.registerCommand('extension.resetMIDI', () => {
		resetMIDI();
	});
	context.subscriptions.push(resetMidiCmd);

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
