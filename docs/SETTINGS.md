# VSLilyPond Settings

### Can be accessed via `Settings (JSON)` or `Settings (UI)`

## :heavy_exclamation_mark: DEPRECATION NOTICE (1.3.0) :heavy_exclamation_mark:

### :x: vslilypond.intellisense.additionalCommandLineArguments

Deprecated in favour of using `vslilypond.compilation.additionalCommandLineArguments`

### :x: vslilypond.compilation.outputFormat

Deprecated in favour of supplying additional command arguments (e.g. --pdf) in `vslilypond.compilation.additionalCommandLineArguments`

## General

### vslilypond.general.pathToLilypond

Path to `lilypond` executable. Default (`lilypond`) assumes lilypond is in PATH variables. Reload required.

Type: `string`

Default value: `lilypond`

## Intellisense

### vslilypond.intellisense.enabled

Displays errors as you type. Disable to improve performance. Reload required.

Type: `boolean`

Default value: `true`

## Compilation

### vslilypond.compilation.compileOnSave

Compiles file upon saving. Disable to improve performance. Reload required.

Type: `boolean`

Default value: `true`

### vslilypond.compilation.additionalCommandLineArguments

Additional command line arguments supplied to `lilypond` upon compilation. Note that `-s` (silent mode) is predefined. Intellisense also uses these arguments.

Type: `string`

Default value: N/A

## MIDI Playback

### vslilypond.midiPlayback.output

MIDI Device used for output. If none specified, the first valid device is used. You can use the command `VSLilyPond: MIDI Playback: Set output device` to select a device from a list.

Type: `string`

Default value: N/A

## MIDI Input

### vslilypond.midiInput.input

MIDI Device used for input. If none specified, the first valid device is used. You can use the command `VSLilyPond: MIDI Input: Set output device` to select a device from a list.

Type: `string`

Default value: N/A

### vslilypond.midiInput.chordMode

Chord mode in music entry. Registers notes that are pressed and held together as a chord instead of sequential notes.

Type: `boolean`

Default value: `false`

### vslilypond.midiInput.relativeMode

Relative mode (as opposed to absolute mode).

Type: `boolean`

Default value: `false`

### vslilypond.midiInput.accidentals

Set accidentals as sharps/flats.

Type: `string`

Default value: `sharps`

## Project

### vslilypond.project.pathToMainCompilationFile

File to compile when a document is saved. If none specified, current file is saved.

Type: `string`

Default value: N/A