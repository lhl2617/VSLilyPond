import * as vscode from 'vscode';
import * as fs from 'fs';
// @ts-ignore
import Tone from 'tone';
import { SoundFontPlayer, midiToSequenceProto, NoteSequence } from '@magenta/music';
import { logger, LogLevel, stripFileExtension } from './util';

let MIDIState: {
    player: SoundFontPlayer | undefined,
    noteSequence: NoteSequence | undefined,
    playing: boolean,
    paused: boolean
} = {
    player: undefined, 
    noteSequence: undefined,
    playing: false,
    paused: false,
};

export const playMIDI = () => {
    try {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            throw new Error(`No active text editor open`);
        }

        const midiFileName = stripFileExtension(activeTextEditor.document.uri.fsPath) + `.mid`;

        fs.readFile(midiFileName, (err, data) => {
            if (err) {
                logger(`Cannot open MIDI file, please make sure you've compiled first.`, LogLevel.error, false);
            }
            const ns: NoteSequence = midiToSequenceProto(data);
            MIDIState.noteSequence = ns;
            if (!MIDIState.player) {
                MIDIState.player = new SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus', Tone.Master);
            }

            MIDIState.player.loadSamples(MIDIState.noteSequence);
            MIDIState.playing = true;
            MIDIState.player.start(MIDIState.noteSequence);
            vscode.window.setStatusBarMessage(`Playing MIDI...`);
            console.log(`playing midi!`);
        });
    }
    catch (err) {
        logger(err.message, LogLevel.error, false);
    }
};