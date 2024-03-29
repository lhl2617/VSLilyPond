# VSLilyPond Commands

### Can be accessed via the Command Palette (Windows: `Ctrl+Shift+P`, Mac: `Cmd+Shift+P`)

## MIDI Playback

### VSLilyPond: MIDI Playback: Play (from start)

Play MIDI from the start. You can also use the `Play MIDI` button on the left of the status bar. MIDI Playback device is set using `VSLilyPond: MIDI Playback: Set output device` command.

### VSLilyPond: MIDI Playback: Play from...

Play MIDI from a user-input timestamp. You can also use the `Play MIDI from...` button on the left of the status bar.

### VSLilyPond: MIDI Playback: Stop

Stop MIDI playback. You can also use the `Stop MIDI` button on the left of the status bar.

### VSLilyPond: MIDI Playback: Pause

Pause MIDI playback. You can also use the `Pause MIDI` button on the left of the status bar.

### VSLilyPond: MIDI Playback: Resume

Resume MIDI playback. You can also use the `Play MIDI` button on the left of the status bar.

### VSLilyPond: MIDI Playback: Reset

Reset MIDI playback state.

### VSLilyPond: MIDI Playback: Set output device

Set workspace-folder specific MIDI output device for playback. You can also change this manually (for more scopes) in settings under `Vslilypond › Midi Playback: Output`.

## MIDI Input

### VSLilyPond: MIDI Input: Start MIDI input

Start MIDI Input. You can also use the `Start MIDI Input` button on the right of the status bar. MIDI input device is set using `VSLilyPond: MIDI Playback: Set input device` command.`

### VSLilyPond: MIDI Input: Stop MIDI input

Stop MIDI Input. You can also use the `Stop MIDI Input` button on the right of the status bar.

### VSLilyPond: MIDI Input: Set input device

Set workspace-folder specific MIDI input device for input. You can also change this manually (for more scopes) in settings under `Vslilypond › Midi Input: Input`.

### VSLilyPond: MIDI Input: Restart MIDI Input

Restart MIDI Input. Try this if the input stops working after changing your MIDI Input device/port.

## Compilation

### VSLilyPond: Compile

Compiles a main lilypond file (if specified in settings). Otherwise, compiles the currently active lilypond file. (Use `VSLilyPond: Compile this specific file` to compile the currently active file). See settings under `Vslilypond › Compilation` for additional settings.

### VSLilyPond: Compile this specific file

Compiles the currently active lilypond file. Use `VSLilyPond: Compile` to compile a main file if specified in settings.

### VSLilyPond: Kill Compilation Process

Kill the compilation process.