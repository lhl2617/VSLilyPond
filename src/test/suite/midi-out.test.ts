import * as assert from "assert"
import * as vscode from "vscode"

import { MIDIOut } from "../../midi-out"

suite(`MIDIOut test suite`, () => {
  vscode.window.showInformationMessage("Start MIDIOut tests.")

  suite(`msToMMSS suite`, () => {
    const msToMMSSTests: {
      name: string
      ms: number
      want: string
    }[] = [
      {
        name: "0",
        ms: 0,
        want: `0:00`,
      },
      {
        name: "almost 1 sec",
        ms: 999,
        want: `0:01`,
      },
      {
        name: "exactly 1 sec",
        ms: 1000,
        want: `0:01`,
      },
      {
        name: "bit more than 1 sec",
        ms: 1001,
        want: `0:01`,
      },
      {
        name: "1 min",
        ms: 60000,
        want: `1:00`,
      },
      {
        name: "large number",
        ms: 6023000,
        want: `100:23`,
      },
    ]

    const msToMMSSTestsException: {
      name: string
      ms: number
      error: Error
    }[] = [
      {
        name: "Negative time",
        ms: -1,
        error: new Error(`Time cannot be negative`),
      },
    ]

    for (const t of msToMMSSTests) {
      const { name, ms, want } = t
      test(name, () => {
        const got = MIDIOut.msToMMSS(ms)
        assert.strictEqual(got, want)
      })
    }

    for (const t of msToMMSSTestsException) {
      const { name, ms, error } = t
      test(name, () => {
        const expectThrow = () => MIDIOut.msToMMSS(ms)
        assert.throws(expectThrow, error)
      })
    }
  })

  suite(`MMSSToms suite`, () => {
    const MMSSTomsTestsException: {
      name: string
      mmss: string
      error: Error
    }[] = [
      {
        name: "Empty string",
        mmss: ``,
        error: new Error(
          ` does not match the required syntax: /^[0-9]+:[0-5][0-9]$/. Valid examples: 1:23, 10:59, 0:12`
        ),
      },
      {
        name: "Number only",
        mmss: `12`,
        error: new Error(
          `12 does not match the required syntax: /^[0-9]+:[0-5][0-9]$/. Valid examples: 1:23, 10:59, 0:12`
        ),
      },
      {
        name: "Number only 2",
        mmss: `11232`,
        error: new Error(
          `11232 does not match the required syntax: /^[0-9]+:[0-5][0-9]$/. Valid examples: 1:23, 10:59, 0:12`
        ),
      },
      {
        name: "0:0",
        mmss: `0:0`,
        error: new Error(
          `0:0 does not match the required syntax: /^[0-9]+:[0-5][0-9]$/. Valid examples: 1:23, 10:59, 0:12`
        ),
      },
      {
        name: "0:60",
        mmss: `0:60`,
        error: new Error(
          `0:60 does not match the required syntax: /^[0-9]+:[0-5][0-9]$/. Valid examples: 1:23, 10:59, 0:12`
        ),
      },
      {
        name: "0:012",
        mmss: `0:012`,
        error: new Error(
          `0:012 does not match the required syntax: /^[0-9]+:[0-5][0-9]$/. Valid examples: 1:23, 10:59, 0:12`
        ),
      },
    ]

    const MMSSTomsTests: {
      name: string
      mmss: string
      want: number
    }[] = [
      {
        name: "Valid 1",
        mmss: `0:00`,
        want: 0,
      },
      {
        name: "Valid 2",
        mmss: `0:59`,
        want: 59000,
      },
      {
        name: "Valid 3",
        mmss: `1:00`,
        want: 60000,
      },
      {
        name: "Valid 4",
        mmss: `123:34`,
        want: 7414000,
      },
    ]

    for (const t of MMSSTomsTests) {
      const { name, mmss, want } = t
      test(name, () => {
        const got = MIDIOut.MMSSToms(mmss)
        assert.strictEqual(got, want)
      })
    }

    for (const t of MMSSTomsTestsException) {
      const { name, mmss, error } = t
      test(name, () => {
        const expectThrow = () => MIDIOut.MMSSToms(mmss)
        assert.throws(expectThrow, error)
      })
    }
  })

  suite(`validateMIDIStartTimeInput suite`, () => {
    const tests: {
      name: string
      durationMS: number
      mmss: string
      want: string | undefined
    }[] = [
      {
        name: "Longer",
        durationMS: 1999,
        mmss: "0:02",
        want: `Duration 0:02 is longer than duration of actual MIDI file 0:02`,
      },
      {
        name: "OK 1",
        durationMS: 2000,
        mmss: "0:02",
        want: undefined,
      },
      {
        name: "OK 2",
        durationMS: 2001,
        mmss: "0:02",
        want: undefined,
      },
    ]

    for (const t of tests) {
      const { name, durationMS, mmss, want } = t
      test(name, () => {
        const durationMMSS = MIDIOut.msToMMSS(durationMS)
        const got = MIDIOut.validateMIDIStartTimeInput(
          durationMS,
          durationMMSS,
          mmss
        )
        assert.strictEqual(got, want)
      })
    }
  })
})
