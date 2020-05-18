import * as vscode from 'vscode';
import { lilypondExists } from './util';
import { compile, CompileMode, initCompile } from './lilypond';
import { subscribeIntellisense } from './intellisense';
import { MIDIOut } from './midiOut';
import { MIDIIn } from './midiIn';
import { langId } from './consts';

export function activate(context: vscode.ExtensionContext) {
	/// need to make sure `lilypond` exists
	if (!lilypondExists()) {
		vscode.window.showErrorMessage(`\`lilypond\` is not found in your system.`);
		return;
	}

	const config = vscode.workspace.getConfiguration(`vslilypond`);




	/// ===== ===== ===== COMPILATION ===== ===== =====
	/// init
	initCompile();

	/// compile to pdf
	const compileCmd = vscode.commands.registerCommand('extension.compile', () => {
		compile();
	});
	context.subscriptions.push(compileCmd);

	/// compile upon saving
	if (config.compilation.compileOnSave) {
		vscode.workspace.onDidSaveTextDocument((textDoc: vscode.TextDocument) => {
			if (textDoc.languageId === langId) {
				compile(CompileMode.onSave, true, textDoc, 1000);
			}
		});
	}





	/// ===== ===== ===== INTELLISENSE ===== ===== =====
	/// intellisense
	if (config.intellisense.enabled) {
		const diagnosticCollection = vscode.languages.createDiagnosticCollection();
		subscribeIntellisense(context, diagnosticCollection);
	}





	/// ===== ===== ===== MIDI PLAYBACK ===== ===== =====
	/// play midi
	const playMidiCmd = vscode.commands.registerCommand('extension.playMIDI', () => {
		MIDIOut.playMIDI();
	});
	context.subscriptions.push(playMidiCmd);

	/// play midi from
	const playMidiFromCmd = vscode.commands.registerCommand('extension.playMIDIFrom', () => {
		MIDIOut.playMIDIFrom();
	});
	context.subscriptions.push(playMidiFromCmd);

	/// stop midi 
	const stopMidiCmd = vscode.commands.registerCommand('extension.stopMIDI', () => {
		MIDIOut.stopMIDI();
	});
	context.subscriptions.push(stopMidiCmd);

	/// pause midi 
	const pauseMidiCmd = vscode.commands.registerCommand('extension.pauseMIDI', () => {
		MIDIOut.pauseMIDI();
	});
	context.subscriptions.push(pauseMidiCmd);

	/// resume midi 
	const resumeMidiCmd = vscode.commands.registerCommand('extension.resumeMIDI', () => {
		MIDIOut.resumeMIDI();
	});
	context.subscriptions.push(resumeMidiCmd);

	/// reset midi 
	const resetMidiCmd = vscode.commands.registerCommand('extension.resetMIDI', () => {
		MIDIOut.resetMIDI();
	});
	context.subscriptions.push(resetMidiCmd);

	/// set midi output device
	const setOutputMidiDeviceCmd = vscode.commands.registerCommand('extension.setOutputMIDIDevice', () => {
		MIDIOut.setOutputMIDIDevice();
	});
	context.subscriptions.push(setOutputMidiDeviceCmd);

	/// status bar items for MIDI playback
	MIDIOut.initMIDIStatusBarItems();





	/// ===== ===== ===== MIDI INPUT ===== ===== =====
	/// start midi input
	const startInputMidiCmd = vscode.commands.registerCommand('extension.startMIDIInput', () => {
		MIDIIn.startMIDIInput();
	});
	context.subscriptions.push(startInputMidiCmd);

	/// start midi input
	const stopInputMidiCmd = vscode.commands.registerCommand('extension.stopMIDIInput', () => {
		MIDIIn.stopMIDIInput();
	});
	context.subscriptions.push(stopInputMidiCmd);

	/// set midi output device
	const setInputMidiDeviceCmd = vscode.commands.registerCommand('extension.setInputMIDIDevice', () => {
		MIDIIn.setInputMIDIDevice();
	});
	context.subscriptions.push(setInputMidiDeviceCmd);

	/// status bar items for MIDI playback
	MIDIIn.initMIDIStatusBarItems();



	
	/// ===== ===== ===== LISTENERS ===== ===== =====
	/// we need to update status bar when active text editor changes
	vscode.window.onDidChangeActiveTextEditor((_) => {
		MIDIIn.updateMIDIStatusBarItem();
		MIDIOut.updateMIDIStatusBarItem();
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
