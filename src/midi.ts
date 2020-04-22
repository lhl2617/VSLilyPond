import * as vscode from 'vscode';
import * as fs from 'fs';
import { logger, LogLevel, stripFileExtension } from './util';

const JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);

console.log(JZZ().info());

export namespace MIDIOut {

    let timeout: any = undefined;
    let statusBarItems: Record<string, vscode.StatusBarItem> = {};

    type MIDIOutStateType = {
        player: any | undefined,
        playing: boolean,
        paused: boolean,
        currMidiFilePath: string | undefined,
    };

    const initialMIDIOutState: MIDIOutStateType = {
        player: undefined,
        playing: false,
        paused: false,
        currMidiFilePath: undefined,
    };

    let MIDIOutState: MIDIOutStateType = initialMIDIOutState;

    const getMidiFilePathFromActiveTextEditor = () => {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            throw new Error(`No active \`lilypond\`text editor open`);
        }
        const midiFileName = stripFileExtension(activeTextEditor.document.uri.fsPath) + `.mid`;
        return midiFileName;
    };

    /// loads midi file based on current active text editor into MIDIOutState.player
    const loadMIDI = () => {
        try {
            const midiFileName = getMidiFilePathFromActiveTextEditor();
            let data: string;
            try {
                data = fs.readFileSync(midiFileName, `binary`);
            }
            catch (err) {
                throw new Error(`Cannot find MIDI file to play - make sure you are outputting a MIDI file`);
            }
            const smf = JZZ.MIDI.SMF(data);
            MIDIOutState.currMidiFilePath = midiFileName;
            MIDIOutState.player = smf.player();

            const config = vscode.workspace.getConfiguration(`vslilypond`);
            const midiout = (config.midiPlayback.output.length) ? JZZ().openMidiOut(config.midiPlayback.output) : JZZ().openMidiOut();
            MIDIOutState.player.connect(midiout);
        }
        catch (err) {
            throw new Error(err.message);
        }
    };


    const getPlayTimeStamp = (durationMS: number, positionMS: number): string => {
        const msToMMSS = (ms: number) => {
            const seconds = Math.round(ms / 1000);
            const mm = Math.round(seconds / 60).toString();
            const ss = Math.round(seconds % 60).toString().padStart(2, `0`);

            return `${mm}:${ss}`;
        };

        const durationMMSS = msToMMSS(durationMS);
        const positionMMSS = msToMMSS(positionMS);
        return `${positionMMSS}\/${durationMMSS}`;
    };


    const pollMIDIStatus = () => {
        const durationMS = MIDIOutState.player.durationMS();
        const positionMS = MIDIOutState.player.positionMS();
        /// need to be called with a 500 ms timeout otherwise it will fail!
        /// this is because position gets set to 0 when the midi finishes playing.
        if (positionMS === 0 && (MIDIOutState.player && MIDIOutState.playing || MIDIOutState.paused)) {
            stopMIDI();
        }
        else {
            vscode.window.setStatusBarMessage(`Playing \`${MIDIOutState.currMidiFilePath}\`: ${getPlayTimeStamp(durationMS, positionMS)}`);
            timeout = setTimeout(pollMIDIStatus, 100);
        }
    };

    export const playMIDI = () => {
        try {
            resetMIDI();
            loadMIDI();

            if (MIDIOutState.player) {
                MIDIOutState.player.play();
                MIDIOutState.playing = true;
                timeout = setTimeout(pollMIDIStatus, 100);
            }
            else {
                throw new Error(`Unable to load MIDI player`);
            }
        }
        catch (err) {
            logger(err.message, LogLevel.error, false);
        }
        updateMIDIStatusBarItem();
    };

    export const stopMIDI = () => {
        try {
            if (MIDIOutState.player && MIDIOutState.playing || MIDIOutState.paused) {
                MIDIOutState.player.stop();
                MIDIOutState.playing = false;
                MIDIOutState.paused = false;
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
        updateMIDIStatusBarItem();
    };

    export const pauseMIDI = () => {
        try {
            if (MIDIOutState.player && MIDIOutState.playing && !MIDIOutState.paused) {
                MIDIOutState.player.pause();
                MIDIOutState.paused = true;
                MIDIOutState.playing = false;

                const durationMS = MIDIOutState.player.durationMS();
                const positionMS = MIDIOutState.player.positionMS();
                vscode.window.setStatusBarMessage(`Paused MIDI: \`${MIDIOutState.currMidiFilePath}\`: ${getPlayTimeStamp(durationMS, positionMS)}`);
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
        updateMIDIStatusBarItem();
    };

    export const resumeMIDI = () => {
        try {
            if (MIDIOutState.player && MIDIOutState.paused && !MIDIOutState.playing) {
                MIDIOutState.player.resume();
                MIDIOutState.paused = false;
                MIDIOutState.playing = true;
                timeout = setTimeout(pollMIDIStatus, 100);
            }
            else {
                playMIDI(); // play from beginning
            }
        }
        catch (err) {
            logger(err.message, LogLevel.error, false);
        }
        updateMIDIStatusBarItem();
    };

    export const resetMIDI = () => {
        if (MIDIOutState.player && MIDIOutState.playing || MIDIOutState.paused) {
            stopMIDI();
        }
        if (timeout) {
            clearTimeout(timeout);
        }
        MIDIOutState = initialMIDIOutState;
        updateMIDIStatusBarItem();
    };

    export const initMIDIStatusBarItems = () => {
        {
            let playBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
            playBtn.command = `extension.resumeMIDI`;
            playBtn.text = `$(play) Play MIDI`;
            playBtn.tooltip = `Play MIDI output file (Resumes if paused)`;
            statusBarItems.play = playBtn;
        }
        {
            let pauseBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
            pauseBtn.command = `extension.pauseMIDI`;
            pauseBtn.text = `$(debug-pause) Pause MIDI`;
            pauseBtn.tooltip = `Pause MIDI playback`;
            statusBarItems.pause = pauseBtn;
        }
        {
            let stopBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
            stopBtn.command = `extension.stopMIDI`;
            stopBtn.text = `$(debug-stop) Stop MIDI`;
            stopBtn.tooltip = `Stop MIDI playback`;
            statusBarItems.stop = stopBtn;
        }
        updateMIDIStatusBarItem();
    };

    /// update status bar item for midi playback
    const updateMIDIStatusBarItem = () => {
        if (MIDIOutState.playing) {
            statusBarItems.play.hide();
            statusBarItems.pause.show();
            statusBarItems.stop.show();
        }
        else {
            statusBarItems.play.show();
            statusBarItems.pause.hide();
            statusBarItems.stop.hide();
        }
    };

    /// set output midi device
    export const setOutputMIDIDevice = () => {
        const outputs: string[] = JZZ().info().outputs.map((x: any) => x.name);
        vscode.window.showQuickPick(outputs).then((val: string | undefined) => {
            if (val) {
                const config = vscode.workspace.getConfiguration(`vslilypond`);
                config.update(`midiPlayback.output`, val, vscode.ConfigurationTarget.Global);
            }
        });
    };
}

export namespace MIDIIn {
    type MIDIInStateType = {
        midiInPort: any,
        active: boolean
    };

    type MIDIInputConfig = { accidentals: `sharps` | `flats`; relativeMode: boolean; chordMode: boolean };

    const initialMidiInState: MIDIInStateType = {
        midiInPort: undefined,
        active: false
    };

    let MIDIInState: MIDIInStateType = initialMidiInState;
    let statusBarItems: Record<string, vscode.StatusBarItem> = {};

    /// notes that haven't been lifted up
    let activeNotes: Set<number> = new Set();
    /// chord notes that have been lifted off 
    let chordNotes: Set<number> = new Set();

    let midiInMsgProcessor = JZZ.Widget();
    /// function called when a midi msg is received

    const getMIDIInputConfig = (): MIDIInputConfig => {
        const config = vscode.workspace.getConfiguration(`vslilypond`);

        const { accidentals, relativeMode, chordMode } = config.midiInput;

        return {
            accidentals: accidentals,
            relativeMode: relativeMode,
            chordMode: chordMode
        };
    };

    /// maps midi numbers from 0-11 to the name based on the sharps/flat mode
    const getNoteChar = (accidentals: `sharps` | `flats`, noteNum: number): string => {
        if (noteNum < 0 || noteNum > 11) {
            throw new Error(`NoteNumber should be within [0,11]; got ${noteNum}`);
        }
        const isSharp = accidentals === `sharps`;
        const map: Record<number, string> = {
            0: `c`,
            1: isSharp ? `cis` : `des`,
            2: `d`,
            3: isSharp ? `dis` : `ees`,
            4: `e`,
            5: `f`,
            6: isSharp ? `fis` : `ges`,
            7: `g`,
            8: isSharp ? `gis` : `aes`,
            9: `a`,
            10: isSharp ? `ais` : `bes`,
            11: `b`
        };
        return map[noteNum];
    };


    const getAbsoluteOctavePostfix = (octaveNum: number): string => {
        if (octaveNum < 0 || octaveNum > 9) {
            throw new Error(`OctaveNumber should be within [0,9]; got ${octaveNum}`);
        }
        if (octaveNum <= 3) {
            return `,`.repeat(3 - octaveNum);
        }
        else {
            return `\'`.repeat(octaveNum - 3);
        }
    };

    const notesToString = (notes: Set<number>, accidentals: `sharps` | `flats`, relativeMode: boolean): string | undefined => {
        try {
            const midiNumberToNoteName = (note: number): string => {
                if (note <= 20 || note >= 128) {
                    throw new Error(`MIDI Note ${note} out of range!`);
                }
                /// C3(48) -> 3
                const octaveNum = Math.trunc(note / 12) - 1;

                /// C3(48) -> 0
                const noteNum = note % 12;

                const fullNoteStr = getNoteChar(accidentals, noteNum) + (relativeMode ? `` : getAbsoluteOctavePostfix(octaveNum));
                return fullNoteStr;
            };


            if (notes.size === 1) {
                /// one note
                return ` ` + midiNumberToNoteName([...notes][0]);
            }
            else if (notes.size > 1) {
                /// chord
                return ` <` +
                    [...notes]
                        .sort()
                        .map(midiNumberToNoteName)
                        .join(` `)
                    + `>`;
            }
        }
        catch (err) {
            logger(`Error outputting note: ${err.message}`, LogLevel.error, false);
        }
    };

    midiInMsgProcessor._receive = (msg: any) => {

        const MIDINoteNumber: number = msg[1];
        const velocity: number = msg[2]; /// 0 if lift
        const MIDIInputConfig = getMIDIInputConfig();
        const { accidentals, relativeMode, chordMode } = MIDIInputConfig;


        const outputNotes = (notes: Set<number>) => {
            const outputString = notesToString(notes, accidentals, relativeMode);
            if (outputString) {
                try {
                    const activeTextEditor = vscode.window.activeTextEditor;
                    if (!activeTextEditor) { throw new Error(`No active text editor open`); }

                    activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                        const position = activeTextEditor.selection.active;
                        editBuilder.insert(position, outputString);
                    });
                }
                catch (err) {
                    logger(err.message, LogLevel.error, false);
                }
            }
        };

        if (velocity) {
            /// press down

            /// if not chord mode, input the note that was still held
            if (!chordMode) {
                if (activeNotes.size) {
                    if (activeNotes.size > 1) {
                        logger(`Outputting a chord despite not in chord mode!`, LogLevel.warning, false);
                    }
                    outputNotes(activeNotes);
                    activeNotes.clear();
                }
            }
            activeNotes.add(MIDINoteNumber);
        }
        else {
            /// lift 
            if (chordMode) {
                /// lifting during chord mode 
                chordNotes.add(MIDINoteNumber);
                activeNotes.delete(MIDINoteNumber);
                if (activeNotes.size === 0) {
                    outputNotes(chordNotes);
                    chordNotes.clear();
                }
            }
            else {
                /// lifting during non-chord mode
                if (activeNotes.size) {
                    if (activeNotes.size > 1) {
                        logger(`Outputting a chord despite not in chord mode!`, LogLevel.warning, false);
                    }
                    outputNotes(activeNotes);
                    activeNotes.clear();
                }
            }
        }

    };

    /// start midi input
    export const startMIDIInput = () => {
        const config = vscode.workspace.getConfiguration(`vslilypond`);
        MIDIInState.midiInPort = (config.midiInput.input.length) ? JZZ().openMidiIn(config.midiInput.input) : JZZ().openMidiIn();

        MIDIInState.midiInPort.connect(midiInMsgProcessor);
        MIDIInState.active = true;
        updateMIDIStatusBarItem();
    };

    export const stopMIDIInput = () => {
        if (MIDIInState.midiInPort) {
            MIDIInState.midiInPort.disconnect();
            MIDIInState.midiInPort.close();
        }
        MIDIInState = initialMidiInState;
        MIDIInState.active = false;
        updateMIDIStatusBarItem();
    };

    /// set input midi device
    export const setInputMIDIDevice = () => {
        const inputs: string[] = JZZ().info().inputs.map((x: any) => x.name);
        vscode.window.showQuickPick(inputs).then((val: string | undefined) => {
            if (val) {
                const config = vscode.workspace.getConfiguration(`vslilypond`);
                config.update(`midiInput.input`, val, vscode.ConfigurationTarget.Global);
            }
        });
    };

    export const initMIDIStatusBarItems = () => {
        {
            let startBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
            startBtn.command = `extension.startMIDIInput`;
            startBtn.text = `$(circle-filled) Start MIDI Input`;
            startBtn.tooltip = `Start MIDI Input`;
            statusBarItems.start = startBtn;
        }
        {
            let stopBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
            stopBtn.command = `extension.stopMIDIInput`;
            stopBtn.text = `$(debug-stop) Stop MIDI Input`;
            stopBtn.tooltip = `Stop MIDI Input`;
            statusBarItems.stop = stopBtn;
        }
        updateMIDIStatusBarItem();
    };

    /// update status bar item for midi playback
    const updateMIDIStatusBarItem = () => {
        if (MIDIInState.active) {
            statusBarItems.start.hide();
            statusBarItems.stop.show();
        }
        else {
            statusBarItems.start.show();
            statusBarItems.stop.hide();
        }
    };
}
