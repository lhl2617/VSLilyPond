import * as vscode from 'vscode';
import * as fs from 'fs';
import { logger, LogLevel, stripFileExtension } from './util';
const JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);

let timeout: NodeJS.Timer | undefined = undefined;

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
        MIDIState.currMidiFilePath = midiFileName;
        MIDIState.player = smf.player();
        MIDIState.player.connect(midiout);
    }
    catch (err) {
        logger(err.message, LogLevel.error, false);
    }
};

const pollMIDIStatus = () => {
    const duration = MIDIState.player.durationMS();
    const position = MIDIState.player.positionMS();

    const percentage = duration > 0 ? ((position / duration) * 100).toFixed(0) : 0;

    /// need to be called with a 500 ms timeout otherwise it will fail!
    if (position === 0 && (MIDIState.player && MIDIState.playing || MIDIState.paused)) {
        stopMIDI();
    }
    else {
        vscode.window.setStatusBarMessage(`Playing \`${MIDIState.currMidiFilePath}\`: ${percentage}\%`);
        timeout = setTimeout(pollMIDIStatus, 100);
    }
};

export const playMIDI = () => {
    try {
        resetMIDI();
        loadMIDI();

        if (MIDIState.player) {
            MIDIState.player.play();
            MIDIState.playing = true;
            timeout = setTimeout(pollMIDIStatus, 500);
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
            if (timeout) {
                clearTimeout(timeout);
            }
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
            MIDIState.playing = false;
            vscode.window.setStatusBarMessage(``);
            if (timeout) {
                clearTimeout(timeout);
            }
        }
        else {
            throw new Error(`No active MIDI file to pause`);
        }
    }
    catch (err) {
        logger(err.message, LogLevel.error, false);
    }
};

export const resumeMIDI = () => {
    try {
        if (MIDIState.player && MIDIState.paused && !MIDIState.playing) {
            MIDIState.player.resume();
            MIDIState.paused = false;
            MIDIState.playing = true;
            timeout = setTimeout(pollMIDIStatus, 500);
        }
        else {
            throw new Error(`No paused MIDI file to resume`);
        }
    }
    catch (err) {
        logger(err.message, LogLevel.error, false);
    }
}

export const resetMIDI = () => {
    if (MIDIState.player && MIDIState.playing || MIDIState.paused) {
        stopMIDI();
    }
    if (timeout) {
        clearTimeout(timeout);
    }
    MIDIState = initialMIDIState;
};