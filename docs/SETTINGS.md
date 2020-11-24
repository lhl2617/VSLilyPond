# VSLilyPond Settings

### Can be accessed via `Settings (JSON)` or `Settings (UI)`

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

### vslilypond.compilation.compileMainFileOnSave

If true, compiles main file set in `Vslilypond › Compilation › Path To Main Compilation File`, else, compiles the currently active file.

Type: `boolean`

Default value: `true`

### vslilypond.compilation.additionalCommandLineArguments

Additional command line arguments supplied to `lilypond` upon compilation. Note that `--loglevel=WARNING` is predefined. Intellisense also uses these arguments.

Type: `string`

Default value: N/A

### vslilypond.compilation.pathToMainCompilationFile

Relative path (from workspace folder root) of the file to compile when a document in a folder/workspace is saved. If none specified, the current active file is compiled.

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