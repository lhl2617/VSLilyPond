import * as vscode from 'vscode';
import * as fs from 'fs';
import * as filetype from 'file-type';
import * as path from 'path';
import { logger, LogLevel, stripFileExtension } from './util';
import * as JZZ from 'jzz';
/// no types for jzz-midi-smf
// @ts-ignore
import * as jzzMidiSmf from 'jzz-midi-smf';
import { langId } from './consts';
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

    export const MMSSToms = (mmss: string): number => {
        const matches = mmss.match(/^[0-9]+:[0-5][0-9]$/);
        if (matches && matches.length && matches[0].length) {
            const [mm, ss] = mmss.split(`:`).map((s) => parseInt(s));
            const res = (mm * 60 + ss) * 1000;
            return res;
        }
        throw new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`);
    };

    export const validateMIDIStartTimeInput = (durationMS: number, durationMMSS: string, mmss: string): string | undefined => {
        try {
            const ms = MMSSToms(mmss);
            if (ms > durationMS) {
                throw new Error(`Duration ${mmss} is longer than duration of actual MIDI file ${durationMMSS}`);
            }
        }
        catch (err) {
            return err.message;
        }
        /// return undefined when valid;
        return undefined;
    };

    /// returns in ms the required start time
    const askAndSetMIDIStartTime = async (durationMS: number): Promise<number> => {
        const durationMMSS = msToMMSS(durationMS);
        const data = vscode.window.showInputBox(
            {
                ignoreFocusOut: true,
                placeHolder: `0:00`,
                prompt: `Duration of MIDI is ${durationMMSS}. Please enter the start timestamp required in the format m:ss.`,
                validateInput: (mmss: string) => validateMIDIStartTimeInput(durationMS, durationMMSS, mmss)
            });
        const value = await data;
        if (value) {
            const res = MMSSToms(value);
            return res;
        }
        return 0;
    };


    /// tries to get the corresponding midi file path from the active text editor
    /// tries in the sequence: .midi, .mid, content-type matching audio/midi
    /// NB potentially could cache from baseFilePath to the midiFilePath; however,
    /// if user changes extension halfway, could cause ambiguities.
    const getMidiFilePathFromWindow = async () => {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            throw new Error(`No active \`lilypond\`text editor open (Please click inside a \`lilypond\` text document to make it active)`);
        }

        const existsCheck = (filePath: string): string | undefined => {
            if (fs.existsSync(filePath)) { return filePath; }
            return undefined;
        };

        /// in the same folder, enumerate through the files with same file name but different extensions
        /// check if their mime type is audio/midi
        /// return the first matching file path
        const getFirstMidiTypeFilePath = async (baseFilePath: string) => {
            const dirname = path.dirname(baseFilePath);

            /// file paths of files with same file name as baseFilePath
            const filePaths =
                fs.readdirSync(dirname)
                    /// add in dirname
                    .map((p: string) => `${dirname}${path.sep}${p}`)
                    /// filter by name (this also takes in files with extra chars)
                    .filter((p: string) => p.substr(0, baseFilePath.length) === baseFilePath)
                    /// sort by shortest baseFilePath, this is to give priority to test-1 instead of test-1-1
                    .sort((a, b) => a.length - b.length);

            /// get the first file that has audio/midi content-type
            for (const p of filePaths) {
                const mimeType = (await filetype.fromFile(p))?.mime;
                if (mimeType === `audio/midi`) {
                    return p;
                }
            }
            return undefined;
        };

        const baseFilePath = stripFileExtension(activeTextEditor.document.uri.fsPath);

        /// no existsCheck required for getFirstMidi... part 
        const midiFileName =
            existsCheck(`${baseFilePath}.midi`) ??
            existsCheck(`${baseFilePath}.mid`) ??
            (await getFirstMidiTypeFilePath(baseFilePath));

        if (!midiFileName) {
            throw new Error(`Cannot find MIDI file to play - make sure you are outputting a MIDI file`);
        }
        return midiFileName;
    };

    /// loads midi file based on current active text editor into MIDIOutState.player
    const loadMIDI = async () => {
        try {
            const midiFileName = await getMidiFilePathFromWindow();

            const data = fs.readFileSync(midiFileName, `binary`);
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
            resetMIDI(true);
            await loadMIDI();

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

    export const playMIDIFrom = async () => {
        try {
            resetMIDI(true);
            await loadMIDI();

            if (MIDIOutState.player) {
                /// get the maximum duration and ask user to input the required duration
                const durationMS = MIDIOutState.player.durationMS();
                const startMS = await askAndSetMIDIStartTime(durationMS);
                MIDIOutState.player.play();
                MIDIOutState.player.jumpMS(startMS);
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

    export const resetMIDI = async (mute: boolean = false) => {
        if (MIDIOutState.player && MIDIOutState.playing || MIDIOutState.paused) {
            stopMIDI();
        }
        if (timeout) {
            clearTimeout(timeout);
        }
        MIDIOutState = initialMIDIOutState;
        logger(`MIDI Playback reset`, LogLevel.info, mute);
        updateMIDIStatusBarItem();
    };

    export const initMIDIStatusBarItems = () => {
        {
            let playBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
            playBtn.command = `extension.resumeMIDI`;
            playBtn.text = `$(debug-start) Play MIDI`;
            playBtn.tooltip = `Play MIDI output file (Resumes if paused)`;
            statusBarItems.play = playBtn;
        }
        {
            let playFromBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
            playFromBtn.command = `extension.playMIDIFrom`;
            playFromBtn.text = `$(debug-continue) Play MIDI From...`;
            playFromBtn.tooltip = `Play MIDI output file from a certain timesatmp`;
            statusBarItems.playFrom = playFromBtn;
        }
        {
            let pauseBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
            pauseBtn.command = `extension.pauseMIDI`;
            pauseBtn.text = `$(debug-pause) Pause MIDI`;
            pauseBtn.tooltip = `Pause MIDI playback`;
            statusBarItems.pause = pauseBtn;
        }
        {
            let stopBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 97);
            stopBtn.command = `extension.stopMIDI`;
            stopBtn.text = `$(debug-stop) Stop MIDI`;
            stopBtn.tooltip = `Stop MIDI playback`;
            statusBarItems.stop = stopBtn;
        }
        updateMIDIStatusBarItem();
    };

    /// update status bar item for midi playback
    export const updateMIDIStatusBarItem = async () => {
        if (await shouldShowStatusBarItems()) {
            if (MIDIOutState.playing) {
                statusBarItems.play.hide();
                statusBarItems.playFrom.hide();
                statusBarItems.pause.show();
                statusBarItems.stop.show();
            }
            else {
                statusBarItems.play.show();
                statusBarItems.playFrom.show();
                statusBarItems.pause.hide();
                statusBarItems.stop.hide();
            }
        }
        else {
            /// hide if no text editor or not LilyPond file
            Object.values(statusBarItems).forEach((x) => x.hide());
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

    const MIDIFileExists = async (): Promise<boolean> => {
        try {
            const midiFilePath = await getMidiFilePathFromWindow();
            if (midiFilePath) {
                return true;
            }
        }
        catch (err) {
            return false;
        }
        return false;
    };

    const shouldShowStatusBarItems = async (): Promise<boolean> => {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor && activeTextEditor.document.languageId === langId && await MIDIFileExists()) {
            return true;
        }
        return false;
    };
}



