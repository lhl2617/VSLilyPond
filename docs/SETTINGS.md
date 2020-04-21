# VSLilyPond Settings

### Can be accessed via `Settings (JSON)` or `Settings (UI)`

## Intellisense

### vslilypond.intellisense.enabled

Displays errors with red underlines as you type. Disable to improve performance. Reload required.

Type: `boolean`

Default value: N/A

### vslilypond.intellisense.additionalCommandLineArguments

Additional command line arguments supplied to `lilypond` upon compiling for intellisense. Note that `-s` (silent mode) is predefined. If required, please also supply necessary arguments compilation additional command line arguments.

Type: `string`

Default value: N/A

## Compilation

### vslilypond.compilation.outputFormat

Output format.

Type: `string`

Default value: `pdf`

### vslilypond.compilation.compileOnSave

Compiles file upon saving. Disable to improve performance. Reload required.

Type: `boolean`

Default value: N/A

### vslilypond.compilation.additionalCommandLineArguments

Additional command line arguments supplied to `lilypond` upon compilation. Note that `-s` (silent mode) is predefined. If you use intellisense, please also supply necessary arguments to the corresponding additional command line arguments.

Type: `string`

Default value: N/A

## MIDI Playback

### vslilypond.midiPlayback.output

MIDI Device used for output. If none specified, first valid device is used. You can use the command `VSLilyPond: MIDI Playback: Set output device` to select a device from a list.

Type: `string`

Default value: N/A

## MIDI Input

### vslilypond.midiInput.input

MIDI Device used for input. If none specified, first valid device is used. You can use the command `VSLilyPond: MIDI Input: Set output device` to select a device from a list.

Type: `string`

Default value: N/A

### vslilypond.midiInput.chordMode

Chord mode in music entry. Registers notes that are pressed and held together as a chord instead of sequential notes.

Type: `boolean`

Default value: N/A

### vslilypond.midiInput.relativeMode

Relative mode (as opposed to absolute mode).

Type: `boolean`

Default value: N/A

### vslilypond.midiInput.accidentals

Set accidentals as sharp/flat.

Type: `string`

Default value: `sharps`