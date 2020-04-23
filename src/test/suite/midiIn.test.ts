import * as assert from 'assert';

import * as vscode from 'vscode';
import { MIDIIn } from '../../midiIn';

type MIDINote = {
    MIDINoteNumber: number,
    velocity: number
};

const eqSet = (a: Set<any>, b: Set<any>) => a.size === b.size && [...a].every(value => b.has(value));

suite(`MIDIIn test suite`, () => {
	vscode.window.showInformationMessage('Start MIDIIn tests.');
    test(`getNoteChar test 1 - exception number below 0`, () => {
        const accidentals: `sharps` | `flats` = `sharps`;
        const noteNum = -1;

        const expectThrow = () => MIDIIn.getNoteChar(accidentals, noteNum);

        assert.throws(expectThrow, new Error(`NoteNumber should be a integer within [0,11]; got ${noteNum}`));
    });

    test(`getNoteChar test 2 - exception number above 11`, () => {
        const accidentals: `sharps` | `flats` = `sharps`;
        const noteNum = 12;

        const expectThrow = () => MIDIIn.getNoteChar(accidentals, noteNum);

        assert.throws(expectThrow, new Error(`NoteNumber should be a integer within [0,11]; got ${noteNum}`));
    });

    test(`getNoteChar test 3 - exception number is float`, () => {
        const accidentals: `sharps` | `flats` = `sharps`;
        const noteNum = 4.23;

        const expectThrow = () => MIDIIn.getNoteChar(accidentals, noteNum);

        assert.throws(expectThrow, new Error(`NoteNumber should be a integer within [0,11]; got ${noteNum}`));
    });

    test(`getNoteChar test 4 - valid C`, () => {
        const accidentals: `sharps` | `flats` = `sharps`;
        const noteNum = 0;

        const got = MIDIIn.getNoteChar(accidentals, noteNum);
        const exp = `c`;

        assert.equal(got, exp);
    });

    test(`getNoteChar test 5 - valid C, agnostic to accidentals`, () => {
        const accidentals: `sharps` | `flats` = `flats`;
        const noteNum = 0;

        const got = MIDIIn.getNoteChar(accidentals, noteNum);
        const exp = `c`;

        assert.equal(got, exp);
    });

    test(`getNoteChar test 5 - 10 sharp`, () => {
        const accidentals: `sharps` | `flats` = `sharps`;
        const noteNum = 10;

        const got = MIDIIn.getNoteChar(accidentals, noteNum);
        const exp = `ais`;

        assert.equal(got, exp);
    });

    test(`getNoteChar test 5 - 10 flat`, () => {
        const accidentals: `sharps` | `flats` = `flats`;
        const noteNum = 10;

        const got = MIDIIn.getNoteChar(accidentals, noteNum);
        const exp = `bes`;

        assert.equal(got, exp);
    });

    test(`getAbsoluteOctavePostfix test 1 - exception below 0`, () => {
        const octaveNum = -1;

        const expectThrow = () => MIDIIn.getAbsoluteOctavePostfix(octaveNum);

        assert.throws(expectThrow, new Error(`OctaveNumber should be an integer within [0,9]; got ${octaveNum}`));
    });

    test(`getAbsoluteOctavePostfix test 2 - exception above 9`, () => {
        const octaveNum = 10;

        const expectThrow = () => MIDIIn.getAbsoluteOctavePostfix(octaveNum);

        assert.throws(expectThrow, new Error(`OctaveNumber should be an integer within [0,9]; got ${octaveNum}`));
    });

    test(`getAbsoluteOctavePostfix test 3 - exception float`, () => {
        const octaveNum = 3.141;

        const expectThrow = () => MIDIIn.getAbsoluteOctavePostfix(octaveNum);

        assert.throws(expectThrow, new Error(`OctaveNumber should be an integer within [0,9]; got ${octaveNum}`));
    });


    test(`getAbsoluteOctavePostfix test 4 - no postfix`, () => {
        const octaveNum = 3;

        const got = MIDIIn.getAbsoluteOctavePostfix(octaveNum);
        const exp = ``;

        assert.equal(got, exp);
    });

    test(`getAbsoluteOctavePostfix test 5 - 9`, () => {
        const octaveNum = 9;

        const got = MIDIIn.getAbsoluteOctavePostfix(octaveNum);
        const exp = `\'\'\'\'\'\'`;

        assert.equal(got, exp);
    });

    test(`getAbsoluteOctavePostfix test 6 - 0`, () => {
        const octaveNum = 0;

        const got = MIDIIn.getAbsoluteOctavePostfix(octaveNum);
        const exp = `,,,`;

        assert.equal(got, exp);
    });

    test(`midiNumberToNoteName test 1 - exception below 20`, () => {
        const note = 19;
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        const expectThrow = () => MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);

        assert.throws(expectThrow, new Error(`MIDI Note should be an integer within [20, 128], got ${note}`));
    });

    test(`midiNumberToNoteName test 2 - exception above 128`, () => {
        const note = 129;
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        const expectThrow = () => MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);

        assert.throws(expectThrow, new Error(`MIDI Note should be an integer within [20, 128], got ${note}`));
    });

    test(`midiNumberToNoteName test 3 - exception not integer`, () => {
        const note = 69.42;
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        const expectThrow = () => MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);

        assert.throws(expectThrow, new Error(`MIDI Note should be an integer within [20, 128], got ${note}`));
    });

    test(`midiNumberToNoteName test 4 - normal test 1`, () => {
        const note = 48;
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `c`;

        assert.equal(got, exp);
    });

    test(`midiNumberToNoteName test 5 - normal test 2 (sharp)`, () => {
        const note = 49;
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `cis`;

        assert.equal(got, exp);
    });

    test(`midiNumberToNoteName test 6 - normal test 3 (flat)`, () => {
        const note = 49;
        const accidentals: `sharps` | `flats` = `flats`;
        const relativeMode = false;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `des`;

        assert.equal(got, exp);
    });

    test(`midiNumberToNoteName test 7 - normal test 4 (relative mode)`, () => {
        const note = 60;
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = true;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `c`;

        assert.equal(got, exp);
    });

    test(`midiNumberToNoteName test 8 - normal test 5 (non-relative mode)`, () => {
        const note = 60;
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode);
        const exp = `c\'`;

        assert.equal(got, exp);
    });

    test(`notesToString test 1 - no notes`, () => {
        const notes: Set<number> = new Set();
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        const got = MIDIIn.notesToString(notes, accidentals, relativeMode);
        const exp = ``;

        assert.equal(got, exp);
    });


    test(`notesToString test 2 - one note`, () => {
        let notes: Set<number> = new Set();
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        notes.add(48);

        const got = MIDIIn.notesToString(notes, accidentals, relativeMode);
        const exp = ` c`;

        assert.equal(got, exp);
    });

    test(`notesToString test 2 - 2 notes`, () => {
        let notes: Set<number> = new Set();
        const accidentals: `sharps` | `flats` = `sharps`;
        const relativeMode = false;

        notes.add(48);
        notes.add(50);

        const got = MIDIIn.notesToString(notes, accidentals, relativeMode);
        const exp = ` <c d>`;

        assert.equal(got, exp);
    });

    test(`processNote test 1 - chordMode off - press down only, no liftoff`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote test 2 - chordMode off - press down & liftoff`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote test 3 - chordMode off - press down & liftoff multiple notes`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote test 4 - chordMode off - press down multiple notes`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote test 5 - chordMode off - press down c major triad, no liftoff`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(52);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote test 6 - chordMode off - press down c major triad, liftoff`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote test 7 - chordMode on - press down one note no liftoff`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });


    test(`processNote test 8 - chordMode on - press down & liftoff`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote test 9 - chordMode on - press down & liftoff multiple notes`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });
    
    test(`processNote test 10 - chordMode on - press down multiple notes`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        expActiveNotes.add(50);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });

    test(`processNote test 11 - chordMode on - press down c major triad, no liftoff`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(48);
        expActiveNotes.add(50);
        expActiveNotes.add(52);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });
    

    test(`processNote test 12 - chordMode on - press down c major triad, liftoff`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });   
    
    test(`processNote test 13 - chordMode on - press down c major triad, liftoff except last`, () => {
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
        assert.equal(output, expOutput);

        let expActiveNotes = new Set();
        expActiveNotes.add(52);
        assert(eqSet(MIDIIn.activeNotes, expActiveNotes));

        let expChordNotes = new Set();
        expChordNotes.add(48);
        expChordNotes.add(50);
        assert(eqSet(MIDIIn.chordNotes, expChordNotes));
    });
});