import * as assert from 'assert';

import * as vscode from 'vscode';
import { MIDIIn } from '../../midiIn';
import { Accidentals } from '../../util';

type MIDINote = {
    MIDINoteNumber: number,
    velocity: number
};

const eqSet = (a: Set<any>, b: Set<any>) => a.size === b.size && [...a].every(value => b.has(value));

suite(`MIDIIn test suite`, () => {
	vscode.window.showInformationMessage('Start MIDIIn tests.');
    test(`getNoteChar - exception number below 0`, () => {
        const accidentals: Accidentals = `sharps`;
        const noteNum = -1;

        const expectThrow = () => MIDIIn.getNoteChar(accidentals, noteNum);

        assert.throws(expectThrow, new Error(`NoteNumber should be a integer within [0,11]; got ${noteNum}`));
    });

    test(`getNoteChar - exception number above 11`, () => {
        const accidentals: Accidentals = `sharps`;
        const noteNum = 12;

        const expectThrow = () => MIDIIn.getNoteChar(accidentals, noteNum);

        assert.throws(expectThrow, new Error(`NoteNumber should be a integer within [0,11]; got ${noteNum}`));
    });

    test(`getNoteChar - exception number is float`, () => {
        const accidentals: Accidentals = `sharps`;
        const noteNum = 4.23;

        const expectThrow = () => MIDIIn.getNoteChar(accidentals, noteNum);

        assert.throws(expectThrow, new Error(`NoteNumber should be a integer within [0,11]; got ${noteNum}`));
    });

    test(`getNoteChar - valid C`, () => {
        const accidentals: Accidentals = `sharps`;
        const noteNum = 0;

        const got = MIDIIn.getNoteChar(accidentals, noteNum);
        const exp = `c`;

        assert.strictEqual(got, exp);
    });

    test(`getNoteChar - valid C, agnostic to accidentals`, () => {
        const accidentals: Accidentals = `flats`;
        const noteNum = 0;

        const got = MIDIIn.getNoteChar(accidentals, noteNum);
        const exp = `c`;

        assert.strictEqual(got, exp);
    });

    test(`getNoteChar - 10 sharp`, () => {
        const accidentals: Accidentals = `sharps`;
        const noteNum = 10;

        const got = MIDIIn.getNoteChar(accidentals, noteNum);
        const exp = `ais`;

        assert.strictEqual(got, exp);
    });

    test(`getNoteChar - 10 flat`, () => {
        const accidentals: Accidentals = `flats`;
        const noteNum = 10;

        const got = MIDIIn.getNoteChar(accidentals, noteNum);
        const exp = `bes`;

        assert.strictEqual(got, exp);
    });

    test(`getAbsoluteOctavePostfix - exception below 0`, () => {
        const octaveNum = -1;

        const expectThrow = () => MIDIIn.getAbsoluteOctavePostfix(octaveNum);

        assert.throws(expectThrow, new Error(`OctaveNumber should be an integer within [0,9]; got ${octaveNum}`));
    });

    test(`getAbsoluteOctavePostfix - exception above 9`, () => {
        const octaveNum = 10;

        const expectThrow = () => MIDIIn.getAbsoluteOctavePostfix(octaveNum);

        assert.throws(expectThrow, new Error(`OctaveNumber should be an integer within [0,9]; got ${octaveNum}`));
    });

    test(`getAbsoluteOctavePostfix - exception float`, () => {
        const octaveNum = 3.141;

        const expectThrow = () => MIDIIn.getAbsoluteOctavePostfix(octaveNum);

        assert.throws(expectThrow, new Error(`OctaveNumber should be an integer within [0,9]; got ${octaveNum}`));
    });


    test(`getAbsoluteOctavePostfix - no postfix`, () => {
        const octaveNum = 3;

        const got = MIDIIn.getAbsoluteOctavePostfix(octaveNum);
        const exp = ``;

        assert.strictEqual(got, exp);
    });

    test(`getAbsoluteOctavePostfix - 9`, () => {
        const octaveNum = 9;

        const got = MIDIIn.getAbsoluteOctavePostfix(octaveNum);
        const exp = `\'\'\'\'\'\'`;

        assert.strictEqual(got, exp);
    });

    test(`getAbsoluteOctavePostfix - 0`, () => {
        const octaveNum = 0;

        const got = MIDIIn.getAbsoluteOctavePostfix(octaveNum);
        const exp = `,,,`;

        assert.strictEqual(got, exp);
    });

    test(`midiNumberToNoteName - exception below 12`, () => {
        const note = 11;
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        const expectThrow = () => MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);

        assert.throws(expectThrow, new Error(`MIDI Note should be an integer within [12, 127], got ${note}`));
    });

    test(`midiNumberToNoteName - exception above 127`, () => {
        const note = 128;
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        const expectThrow = () => MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);

        assert.throws(expectThrow, new Error(`MIDI Note should be an integer within [12, 127], got ${note}`));
    });

    test(`midiNumberToNoteName - exception not integer`, () => {
        const note = 69.42;
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        const expectThrow = () => MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);

        assert.throws(expectThrow, new Error(`MIDI Note should be an integer within [12, 127], got ${note}`));
    });

    test(`midiNumberToNoteName - normal test 1`, () => {
        const note = 48;
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `c`;

        assert.strictEqual(got, exp);
    });

    test(`midiNumberToNoteName - normal (sharp)`, () => {
        const note = 49;
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `cis`;

        assert.strictEqual(got, exp);
    });

    test(`midiNumberToNoteName - normal (flat)`, () => {
        const note = 49;
        const accidentals: Accidentals = `flats`;
        const relativeMode = false;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `des`;

        assert.strictEqual(got, exp);
    });

    test(`midiNumberToNoteName - normal (relative mode)`, () => {
        const note = 60;
        const accidentals: Accidentals = `sharps`;
        const relativeMode = true;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `c`;

        assert.strictEqual(got, exp);
    });

    test(`midiNumberToNoteName - normal (non-relative mode)`, () => {
        const note = 60;
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `c\'`;

        assert.strictEqual(got, exp);
    });

    test(`notesToString - no notes`, () => {
        const notes: Set<number> = new Set();
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        const got = MIDIIn.notesToString(notes, accidentals, relativeMode);
        const exp = ``;

        assert.strictEqual(got, exp);
    });


    test(`notesToString - one note`, () => {
        let notes: Set<number> = new Set();
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        notes.add(48);

        const got = MIDIIn.notesToString(notes, accidentals, relativeMode);
        const exp = ` c`;

        assert.strictEqual(got, exp);
    });

    test(`notesToString - 2 notes`, () => {
        let notes: Set<number> = new Set();
        const accidentals: Accidentals = `sharps`;
        const relativeMode = false;

        notes.add(48);
        notes.add(50);

        const got = MIDIIn.notesToString(notes, accidentals, relativeMode);
        const exp = ` <c d>`;

        assert.strictEqual(got, exp);
    });

    test(`processNote - chordMode off - press down only, no liftoff`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: false,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = ``;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote - chordMode off - press down & liftoff`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: false,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = `48`;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote - chordMode off - press down & liftoff multiple notes`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 0 },
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: false,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = `48485048`;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote - chordMode off - press down multiple notes`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 1 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: false,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = `4850`;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote - chordMode off - press down c major triad, no liftoff`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 52, velocity: 1 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: false,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = `4850`;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(52);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote - chordMode off - press down c major triad, liftoff`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 52, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
            { MIDINoteNumber: 50, velocity: 0 },
            { MIDINoteNumber: 52, velocity: 0 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: false,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = `485052`;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote - chordMode on - press down one note no liftoff`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: true,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = ``;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });


    test(`processNote - chordMode on - press down & liftoff`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: true,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = `48`;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote - chordMode on - press down & liftoff multiple notes`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 0 },
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: true,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = `48485048`;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });
    
    test(`processNote - chordMode on - press down multiple notes`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 1 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: true,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = ``;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        expActiveNotes.add(50);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote - chordMode on - press down c major triad, no liftoff`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 52, velocity: 1 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: true,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = ``;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        expActiveNotes.add(50);
        expActiveNotes.add(52);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });
    

    test(`processNote - chordMode on - press down c major triad, liftoff`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 52, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
            { MIDINoteNumber: 50, velocity: 0 },
            { MIDINoteNumber: 52, velocity: 0 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: true,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = `485052`;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });   
    
    test(`processNote - chordMode on - press down c major triad, liftoff except last`, () => {
        MIDIIn.activeNotes.clear();
        MIDIIn.chordNotes.clear();

        const MIDINotes: MIDINote[] = [
            { MIDINoteNumber: 48, velocity: 1 },
            { MIDINoteNumber: 50, velocity: 1 },
            { MIDINoteNumber: 52, velocity: 1 },
            { MIDINoteNumber: 48, velocity: 0 },
            { MIDINoteNumber: 50, velocity: 0 },
        ];

        let output = ``; /// collects output from outputNotesFn
        const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
            [...notes].forEach((note) => output += note.toString());
        };

        const MIDIInputConfig: MIDIIn.MIDIInputConfig = {
            accidentals: `sharps`,
            relativeMode: true,
            chordMode: true,
        };

        MIDINotes.forEach((note) => {
            MIDIIn.processNote(note.MIDINoteNumber, note.velocity, MIDIInputConfig)(testOutputNotesFn);
        });

        const expOutput = ``;
        assert.strictEqual(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(52);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        expChordNotes.add(48);
        expChordNotes.add(50);
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });
});