import * as assert from "assert"
import * as vscode from "vscode"
import { MIDIIn } from "../../midi-in"
import { Accidentals } from "../../util"

type MIDINote = {
  MIDINoteNumber: number
  keydown: boolean
}

const eqSet = (a: Set<unknown>, b: Set<unknown>) =>
  a.size === b.size && [...a].every((value) => b.has(value))

suite(`MIDIIn Test Suite`, () => {
  vscode.window.showInformationMessage("Start MIDIIn tests.")

  suite(`getNoteChar suite`, () => {
    const getNoteCharTestsException: {
      name: string
      accidentals: Accidentals
      noteNum: number
      error: Error
    }[] = [
      {
        name: "Number below 0",
        accidentals: `sharps`,
        noteNum: -1,
        error: new Error(
          `NoteNumber should be a integer within [0,11]; got -1`
        ),
      },
      {
        name: "Exception number above 11",
        accidentals: `sharps`,
        noteNum: 12,
        error: new Error(
          `NoteNumber should be a integer within [0,11]; got 12`
        ),
      },
      {
        name: "Number is float",
        accidentals: `sharps`,
        noteNum: 4.23,
        error: new Error(
          `NoteNumber should be a integer within [0,11]; got 4.23`
        ),
      },
    ]

    const getNoteCharTests: {
      name: string
      accidentals: Accidentals
      noteNum: number
      want: string
    }[] = [
      {
        name: "Valid C",
        accidentals: `sharps`,
        noteNum: 0,
        want: `c`,
      },
      {
        name: "Valid C, agnostic to accidentals",
        accidentals: `flats`,
        noteNum: 0,
        want: `c`,
      },
      {
        name: "10 sharp",
        accidentals: `sharps`,
        noteNum: 10,
        want: `ais`,
      },
      {
        name: "10 flat",
        accidentals: `flats`,
        noteNum: 10,
        want: `bes`,
      },
    ]

    for (const t of getNoteCharTestsException) {
      const { name, accidentals, noteNum, error } = t
      test(name, () => {
        const expectThrow = () => MIDIIn.getNoteChar(accidentals, noteNum)
        assert.throws(expectThrow, error)
      })
    }
    for (const t of getNoteCharTests) {
      const { name, accidentals, noteNum, want } = t
      test(name, () => {
        const got = MIDIIn.getNoteChar(accidentals, noteNum)
        assert.strictEqual(got, want)
      })
    }
  })

  suite(`getAbsoluteOctavePostfix suite`, () => {
    const getAbsoluteOctavePostfixTestsException: {
      name: string
      octaveNum: number
      error: Error
    }[] = [
      {
        name: "Below 0",
        octaveNum: -1,
        error: new Error(
          `OctaveNumber should be an integer within [0,9]; got -1`
        ),
      },
      {
        name: "Above 10",
        octaveNum: 10,
        error: new Error(
          `OctaveNumber should be an integer within [0,9]; got 10`
        ),
      },
      {
        name: "Float",
        octaveNum: 3.141,
        error: new Error(
          `OctaveNumber should be an integer within [0,9]; got 3.141`
        ),
      },
    ]

    const getAbsoluteOctavePostfixTests: {
      name: string
      octaveNum: number
      want: string
    }[] = [
      {
        name: "No postfix",
        octaveNum: 3,
        want: ``,
      },
      {
        name: "9",
        octaveNum: 9,
        want: `''''''`,
      },
      {
        name: "0",
        octaveNum: 0,
        want: `,,,`,
      },
    ]

    for (const t of getAbsoluteOctavePostfixTestsException) {
      const { name, octaveNum, error } = t
      test(name, () => {
        const expectThrow = () => MIDIIn.getAbsoluteOctavePostfix(octaveNum)
        assert.throws(expectThrow, error)
      })
    }
    for (const t of getAbsoluteOctavePostfixTests) {
      const { name, octaveNum, want } = t
      test(name, () => {
        const got = MIDIIn.getAbsoluteOctavePostfix(octaveNum)
        assert.strictEqual(got, want)
      })
    }
  })

  suite(`midiNumberToNoteName suite`, () => {
    const midiNumberToNoteNameTestsException: {
      name: string
      note: number
      accidentals: Accidentals
      relativeMode: boolean
      error: Error
    }[] = [
      {
        name: "Below 12",
        note: 11,
        accidentals: `sharps`,
        relativeMode: false,
        error: new Error(
          `MIDI Note should be an integer within [12, 127], got 11`
        ),
      },
      {
        name: "Above 127",
        note: 128,
        accidentals: `sharps`,
        relativeMode: false,
        error: new Error(
          `MIDI Note should be an integer within [12, 127], got 128`
        ),
      },
      {
        name: "Float",
        note: 69.42,
        accidentals: `sharps`,
        relativeMode: false,
        error: new Error(
          `MIDI Note should be an integer within [12, 127], got 69.42`
        ),
      },
    ]

    const midiNumberToNoteNameTests: {
      name: string
      note: number
      accidentals: Accidentals
      relativeMode: boolean
      want: string
    }[] = [
      {
        name: "Normal 1",
        note: 48,
        accidentals: `sharps`,
        relativeMode: false,
        want: `c`,
      },
      {
        name: "Normal (sharp)",
        note: 49,
        accidentals: `sharps`,
        relativeMode: false,
        want: `cis`,
      },
      {
        name: "Normal (flat)",
        note: 49,
        accidentals: `flats`,
        relativeMode: false,
        want: `des`,
      },
      {
        name: "Normal (relative mode)",
        note: 60,
        accidentals: `sharps`,
        relativeMode: true,
        want: `c`,
      },
      {
        name: "Normal (non-relative mode)",
        note: 60,
        accidentals: `sharps`,
        relativeMode: false,
        want: `c'`,
      },
    ]

    for (const t of midiNumberToNoteNameTestsException) {
      const { name, note, accidentals, relativeMode, error } = t
      test(name, () => {
        const expectThrow = () =>
          MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode)
        assert.throws(expectThrow, error)
      })
    }
    for (const t of midiNumberToNoteNameTests) {
      const { name, note, accidentals, relativeMode, want } = t
      test(name, () => {
        const got = MIDIIn.midiNumberToNoteName(note, accidentals, relativeMode)
        assert.strictEqual(got, want)
      })
    }
  })

  suite(`notesToString suite`, () => {
    const tests: {
      name: string
      notes: Set<number>
      accidentals: Accidentals
      relativeMode: boolean
      want: string
    }[] = [
      {
        name: "No notes",
        notes: new Set(),
        accidentals: `sharps`,
        relativeMode: false,
        want: ``,
      },
      {
        name: "One note",
        notes: new Set([48]),
        accidentals: `sharps`,
        relativeMode: false,
        want: ` c`,
      },
      {
        name: "Two notes",
        notes: new Set([48, 50]),
        accidentals: `sharps`,
        relativeMode: false,
        want: ` <c d>`,
      },
    ]
    for (const t of tests) {
      const { name, notes, accidentals, relativeMode, want } = t
      test(name, () => {
        const got = MIDIIn.notesToString(notes, accidentals, relativeMode)
        assert.strictEqual(got, want)
      })
    }
  })

  suite(`processNote suite`, () => {
    const tests: {
      name: string
      MIDINotes: MIDINote[]
      MIDIInputConfig: MIDIIn.MIDIInputConfig
      want: string
      wantActiveNotes: Set<number>
      wantChordNotes: Set<number>
    }[] = [
      {
        name: "chordMode off - press down only, no liftoff",
        MIDINotes: [{ MIDINoteNumber: 48, keydown: true }],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: false,
        },
        want: ``,
        wantActiveNotes: new Set([48]),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode off - press down & liftoff",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: false,
        },
        want: `48`,
        wantActiveNotes: new Set(),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode off - press down & liftoff multiple notes",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 50, keydown: false },
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: false,
        },
        want: `48485048`,
        wantActiveNotes: new Set(),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode off - press down multiple notes",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 48, keydown: true },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: false,
        },
        want: `4850`,
        wantActiveNotes: new Set([48]),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode off - press down c major triad, no liftoff",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 52, keydown: true },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: false,
        },
        want: `4850`,
        wantActiveNotes: new Set([52]),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode off - press down c major triad, liftoff",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 52, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
          { MIDINoteNumber: 50, keydown: false },
          { MIDINoteNumber: 52, keydown: false },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: false,
        },
        want: `485052`,
        wantActiveNotes: new Set(),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode on - press down one note no liftoff",
        MIDINotes: [{ MIDINoteNumber: 48, keydown: true }],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: true,
        },
        want: ``,
        wantActiveNotes: new Set([48]),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode on - press down & liftoff",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: true,
        },
        want: `48`,
        wantActiveNotes: new Set(),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode on - press down & liftoff multiple notes",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 50, keydown: false },
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: true,
        },
        want: `48485048`,
        wantActiveNotes: new Set(),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode on - press down multiple notes",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 48, keydown: true },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: true,
        },
        want: ``,
        wantActiveNotes: new Set([48, 50]),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode on - press down c major triad, no liftoff",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 52, keydown: true },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: true,
        },
        want: ``,
        wantActiveNotes: new Set([48, 50, 52]),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode on - press down c major triad, liftoff",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 52, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
          { MIDINoteNumber: 50, keydown: false },
          { MIDINoteNumber: 52, keydown: false },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: true,
        },
        want: `485052`,
        wantActiveNotes: new Set(),
        wantChordNotes: new Set(),
      },
      {
        name: "chordMode on - press down c major triad, liftoff except last",
        MIDINotes: [
          { MIDINoteNumber: 48, keydown: true },
          { MIDINoteNumber: 50, keydown: true },
          { MIDINoteNumber: 52, keydown: true },
          { MIDINoteNumber: 48, keydown: false },
          { MIDINoteNumber: 50, keydown: false },
        ],
        MIDIInputConfig: {
          accidentals: `sharps`,
          relativeMode: true,
          chordMode: true,
        },
        want: ``,
        wantActiveNotes: new Set([52]),
        wantChordNotes: new Set([48, 50]),
      },
    ]

    let output = `` // collects output from outputNotesFn
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testOutputNotesFn: MIDIIn.OutputNotesFnType = (notes, _1, _2) => {
      // eslint-disable-next-line prettier/prettier
      [...notes].forEach((note) => (output += note.toString()))
    }

    for (const t of tests) {
      const {
        name,
        MIDINotes,
        MIDIInputConfig,
        want,
        wantActiveNotes,
        wantChordNotes,
      } = t
      test(name, () => {
        MIDIIn.activeNotes.clear()
        MIDIIn.chordNotes.clear()

        output = ``

        MIDINotes.forEach((note) => {
          MIDIIn.processNote(
            note.MIDINoteNumber,
            note.keydown,
            MIDIInputConfig
          )(testOutputNotesFn)
        })

        assert.strictEqual(output, want)
        assert(eqSet(MIDIIn.activeNotes, wantActiveNotes))
        assert(eqSet(MIDIIn.chordNotes, wantChordNotes))
      })
    }
  })
})
