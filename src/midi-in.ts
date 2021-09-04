import * as vscode from "vscode"
import { logger, LogLevel, getConfiguration, Accidentals } from "./util"
import * as JZZ from "jzz"
// no types for jzz-midi-smf
// @ts-ignore
import * as jzzMidiSmf from "jzz-midi-smf"
import { langId } from "./consts"
jzzMidiSmf(JZZ)
export namespace MIDIIn {
  type MIDIInStateType = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    midiInPort: any
    active: boolean
  }

  export type MIDIInputConfig = {
    accidentals: Accidentals
    relativeMode: boolean
    chordMode: boolean
  }

  const initialMidiInState: MIDIInStateType = {
    midiInPort: undefined,
    active: false,
  }

  let MIDIInState: MIDIInStateType = initialMidiInState
  const statusBarItems: Record<string, vscode.StatusBarItem> = {}

  // notes that haven't been lifted up
  export const activeNotes: Set<number> = new Set()
  // chord notes that have been lifted off
  export const chordNotes: Set<number> = new Set()

  const midiInMsgProcessor = JZZ.Widget()
  // function called when a midi msg is received

  const getMIDIInputConfig = (): MIDIInputConfig => {
    const config = getConfiguration()

    const { accidentals, relativeMode, chordMode } = config.midiInput

    return {
      accidentals: accidentals,
      relativeMode: relativeMode,
      chordMode: chordMode,
    }
  }

  export const getAbsoluteOctavePostfix = (octaveNum: number): string => {
    if (!Number.isInteger(octaveNum) || octaveNum < 0 || octaveNum > 9) {
      throw new Error(
        `OctaveNumber should be an integer within [0,9]; got ${octaveNum}`
      )
    }
    if (octaveNum <= 3) {
      return `,`.repeat(3 - octaveNum)
    } else {
      return `'`.repeat(octaveNum - 3)
    }
  }

  // maps midi numbers from 0-11 to the name based on the sharps/flat mode
  export const getNoteChar = (
    accidentals: Accidentals,
    noteNum: number
  ): string => {
    const isSharp = accidentals === `sharps`
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
      11: `b`,
    }

    if (!(noteNum in map)) {
      throw new Error(
        `NoteNumber should be a integer within [0,11]; got ${noteNum}`
      )
    }
    return map[noteNum]
  }

  export const midiNumberToNoteName = (
    note: number,
    accidentals: Accidentals,
    relativeMode: boolean
  ): string => {
    if (!Number.isInteger(note) || note < 12 || note > 127) {
      throw new Error(
        `MIDI Note should be an integer within [12, 127], got ${note}`
      )
    }
    // C3(48) -> 3
    const octaveNum = Math.trunc(note / 12) - 1

    // C3(48) -> 0
    const noteNum = note % 12

    const fullNoteStr =
      getNoteChar(accidentals, noteNum) +
      (relativeMode ? `` : getAbsoluteOctavePostfix(octaveNum))
    return fullNoteStr
  }

  export const notesToString = (
    notes: Set<number>,
    accidentals: Accidentals,
    relativeMode: boolean
  ): string => {
    try {
      if (notes.size === 1) {
        // one note
        return (
          ` ` + midiNumberToNoteName([...notes][0], accidentals, relativeMode)
        )
      } else if (notes.size > 1) {
        // chord
        return (
          ` <` +
          [...notes]
            .sort()
            .map((note) =>
              midiNumberToNoteName(note, accidentals, relativeMode)
            )
            .join(` `) +
          `>`
        )
      }
    } catch (err) {
      logger(`Error outputting note: ${err.message}`, LogLevel.error, false)
    }
    return ``
  }

  export type OutputNotesFnType = (
    notes: Set<number>,
    accidentals: "sharps" | "flats",
    relativeMode: boolean
  ) => void

  // actually output the notes as text in the editor
  const outputNotes: OutputNotesFnType = (
    notes: Set<number>,
    accidentals: Accidentals,
    relativeMode: boolean
  ) => {
    const outputString = notesToString(notes, accidentals, relativeMode)
    if (outputString.length) {
      try {
        const activeTextEditor = vscode.window.activeTextEditor
        if (!activeTextEditor) {
          throw new Error(`No active text editor open`)
        }

        activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
          const position = activeTextEditor.selection.active
          editBuilder.insert(position, outputString)
        })
      } catch (err) {
        logger(err.message, LogLevel.error, false)
      }
    }
  }

  export const processNote =
    (
      MIDINoteNumber: number,
      keyDown: boolean,
      MIDIInputConfig: MIDIInputConfig
    ) =>
    (outputNoteFn: OutputNotesFnType) => {
      const { accidentals, relativeMode, chordMode } = MIDIInputConfig

      if (keyDown) {
        // press down

        // if not chord mode, input the note that was still held
        if (!chordMode) {
          if (activeNotes.size) {
            if (activeNotes.size > 1) {
              logger(
                `Outputting a chord despite not in chord mode!`,
                LogLevel.warning,
                false
              )
            }
            outputNoteFn(activeNotes, accidentals, relativeMode)
            activeNotes.clear()
          }
        }
        activeNotes.add(MIDINoteNumber)
      } else {
        // lift
        if (chordMode) {
          // lifting during chord mode
          chordNotes.add(MIDINoteNumber)
          activeNotes.delete(MIDINoteNumber)
          if (activeNotes.size === 0) {
            outputNoteFn(chordNotes, accidentals, relativeMode)
            chordNotes.clear()
          }
        } else {
          // lifting during non-chord mode
          if (activeNotes.size) {
            if (activeNotes.size > 1) {
              logger(
                `Outputting a chord despite not in chord mode!`,
                LogLevel.warning,
                false
              )
            }
            outputNoteFn(activeNotes, accidentals, relativeMode)
            activeNotes.clear()
          }
        }
      }
    }

  // ._receive is passed to JZZ from jzz-midi-smf
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  midiInMsgProcessor._receive = (msg: any) => {
    const statusByte: number = msg[0]
    const MIDINoteNumber: number = msg[1]
    if (
      [0x80, 0x90].includes(statusByte) &&
      MIDINoteNumber >= 12 &&
      MIDINoteNumber <= 127
    ) {
      const keyDown: boolean = statusByte === 0x90 // 0x90 indicates a keyDown event
      const MIDIInputConfig = getMIDIInputConfig()
      processNote(MIDINoteNumber, keyDown, MIDIInputConfig)(outputNotes)
    } else {
      logger(`Received other MIDI message: ${msg}`, LogLevel.warning, true)
    }
  }

  // start midi input
  export const startMIDIInput = async () => {
    try {
      const inputs = await getInputMIDIDevices()
      if (inputs.length === 0) {
        throw new Error(`No input MIDI devices are found.`)
      }
      const config = getConfiguration()
      MIDIInState.midiInPort = config.midiInput.input.length
        ? JZZ().openMidiIn(config.midiInput.input)
        : JZZ().openMidiIn()

      MIDIInState.midiInPort.connect(midiInMsgProcessor)
      MIDIInState.active = true
    } catch (err) {
      logger(err.message, LogLevel.error, false)
    }
    updateMIDIStatusBarItem()
  }

  export const stopMIDIInput = async () => {
    if (MIDIInState.midiInPort) {
      MIDIInState.midiInPort.disconnect()
      MIDIInState.midiInPort.close()
    }
    MIDIInState = initialMidiInState
    MIDIInState.active = false
    updateMIDIStatusBarItem()
  }

  const getInputMIDIDevices = async () => {
    const inputs: string[] = JZZ()
      .info()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .inputs.map((x: any) => x.name)
    return inputs
  }

  // set input midi device
  export const setInputMIDIDevice = async () => {
    const inputs = await getInputMIDIDevices()
    vscode.window.showQuickPick(inputs).then((val: string | undefined) => {
      if (val) {
        const config = getConfiguration()
        config.update(`midiInput.input`, val)
      }
    })
  }

  export const initMIDIStatusBarItems = () => {
    {
      const startBtn = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        2
      )
      startBtn.command = `vslilypond.startMIDIInput`
      startBtn.text = `$(circle-filled) Start MIDI Input`
      startBtn.tooltip = `Start MIDI Input`
      statusBarItems.start = startBtn
    }
    {
      const stopBtn = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        1
      )
      stopBtn.command = `vslilypond.stopMIDIInput`
      stopBtn.text = `$(debug-stop) Stop MIDI Input`
      stopBtn.tooltip = `Stop MIDI Input`
      statusBarItems.stop = stopBtn
    }
    updateMIDIStatusBarItem()
  }

  const shouldShowStatusBarItems = (): boolean => {
    const activeTextEditor = vscode.window.activeTextEditor
    if (activeTextEditor && activeTextEditor.document.languageId === langId) {
      return true
    }
    return false
  }

  // update status bar item for midi playback
  export const updateMIDIStatusBarItem = async () => {
    if (shouldShowStatusBarItems()) {
      if (MIDIInState.active) {
        statusBarItems.start.hide()
        statusBarItems.stop.show()
      } else {
        statusBarItems.start.show()
        statusBarItems.stop.hide()
      }
    } else {
      // hide if no text editor or not LilyPond file
      Object.values(statusBarItems).forEach((x) => x.hide())
    }
  }
}
