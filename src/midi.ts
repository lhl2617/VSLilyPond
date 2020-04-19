import * as vscode from 'vscode';
import * as fs from 'fs';
import { logger, LogLevel, stripFileExtension } from './util';
const JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);

const midiout = JZZ().openMidiOut();

type MIDIStateType = {
    player: any | undefined,
    playing: boolean,
    paused: boolean,
    currMidiFilePath: string | undefined,
};

const initialMIDIState: MIDIStateType = {
    player: undefined,
    playing: false,
    paused: false,
    currMidiFilePath: undefined,
};

let MIDIState: MIDIStateType = initialMIDIState;

const getMidiFilePathFromActiveTextEditor = () => {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
        throw new Error(`No active text editor open`);
    }
    const midiFileName = stripFileExtension(activeTextEditor.document.uri.fsPath) + `.mid`;
    console.log(midiFileName);
    return midiFileName;
};

/// loads midi file based on current active text editor into MIDIState.player
const loadMIDI = () => {
    try {
        const midiFileName = getMidiFilePathFromActiveTextEditor();

        const data = fs.readFileSync(midiFileName, `binary`);
        const smf = JZZ.MIDI.SMF(data);
        MIDIState.player = smf.player();          
    } 
    catch (err) {
        logger(err.message, LogLevel.error, false);
    }
};

export const playMIDI = () => {
    try {
        if (!MIDIState.player
            || MIDIState.currMidiFilePath && MIDIState.currMidiFilePath !== getMidiFilePathFromActiveTextEditor()) {
            loadMIDI();
        }

        if (MIDIState.player) {
            if (MIDIState.playing) {
                // stop it first
                stopMIDI();
            }
    
            if (MIDIState.paused) {
                // resume if paused
                MIDIState.player.resume();
                MIDIState.paused = false;
            }
            else {
                MIDIState.player.play();
            }
            MIDIState.playing = true;   
            vscode.window.setStatusBarMessage(`Playing ${MIDIState.currMidiFilePath}`);     
        }
        else {
            throw new Error(`Unable to load MIDI player`);
        }
    }
    catch (err) {
        logger(err.message, LogLevel.error, false);
    }
};

export const stopMIDI = () => {
    try {
        if (MIDIState.player && MIDIState.playing || MIDIState.paused) {
            MIDIState.player.stop();
            MIDIState.playing = false;
            MIDIState.paused = false;
            vscode.window.setStatusBarMessage(``);   
        }
        else {
            throw new Error(`No active MIDI file to stop`);
        }
    }
    catch (err) {
        logger(err.message, LogLevel.error, false);
    }
};

export const pauseMIDI = () => {
    try {
        if (MIDIState.player && MIDIState.playing && !MIDIState.paused) {
            MIDIState.player.pause();
            MIDIState.paused = true;
            vscode.window.setStatusBarMessage(``);   
        }
        else {
            throw new Error(`No active MIDI file to pause`);
        }
    }
    catch (err) {
        logger(err.message, LogLevel.error, false);
    }
};

export const resetMIDI = () => {
    stopMIDI();
    MIDIState = initialMIDIState;
};