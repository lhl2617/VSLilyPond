import * as vscode from 'vscode';
import * as fs from 'fs';
import { logger, LogLevel, stripFileExtension } from './util';
import * as JZZ from 'jzz';
/// no types for jzz-midi-smf
// @ts-ignore
import * as jzzMidiSmf from 'jzz-midi-smf';
jzzMidiSmf(JZZ);

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

    export const msToMMSS = (ms: number) => {
        if (ms < 0) {
            throw new Error(`Time cannot be negative`);
        }
        const seconds = Math.round(ms / 1000);
        const mm = Math.round(seconds / 60).toString();
        const ss = Math.round(seconds % 60).toString().padStart(2, `0`);

        return `${mm}:${ss}`;
    };

    const getMidiFilePathFromWindow = () => {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            throw new Error(`No active \`lilypond\`text editor open (Please click inside a \`lilypond\` text document to make it active)`);
        }
        const midiFileName = stripFileExtension(activeTextEditor.document.uri.fsPath) + `.mid`;
        return midiFileName;
    };

    /// loads midi file based on current active text editor into MIDIOutState.player
    const loadMIDI = () => {
        try {
            const midiFileName = getMidiFilePathFromWindow();
            let data: string;
            try {
                data = fs.readFileSync(midiFileName, `binary`);
            }
            catch (err) {
                throw new Error(`Cannot find MIDI file to play - make sure you are outputting a MIDI file`);
            }
            /// .SMF is passed to JZZ from jzz-midi-smf
            // @ts-ignore
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
        const durationMMSS = msToMMSS(durationMS);
        const positionMMSS = msToMMSS(positionMS);
        return `${positionMMSS}\/${durationMMSS}`;
    };


    const pollMIDIStatus = async () => {
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

    export const playMIDI = async () => {
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

    export const stopMIDI = async () => {
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

    export const pauseMIDI = async () => {
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

    export const resumeMIDI = async () => {
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

    export const resetMIDI = async () => {
        if (MIDIOutState.player && MIDIOutState.playing || MIDIOutState.paused) {
            stopMIDI();
        }
        if (timeout) {
            clearTimeout(timeout);
        }
        MIDIOutState = initialMIDIOutState;
        logger(`MIDI Playback reset`, LogLevel.info, false);
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
    const updateMIDIStatusBarItem = async () => {
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
    export const setOutputMIDIDevice = async () => {
        const outputs: string[] = JZZ().info().outputs.map((x: any) => x.name);
        vscode.window.showQuickPick(outputs).then((val: string | undefined) => {
            if (val) {
                const config = vscode.workspace.getConfiguration(`vslilypond`);
                config.update(`midiPlayback.output`, val, vscode.ConfigurationTarget.Global);
            }
        });
    };
}



