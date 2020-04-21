# VSLilyPond

Provides syntax and error highlighting, compilation on save, MIDI (input and playback) support for [LilyPond](http://lilypond.org/) in VSCode. Works with any VSCode supported PDF previewer for PDF preview.

## Features

### Syntax and error highlighting
![Syntax and error highlighting](./docs/assets/gifs/syntaxHighlighting.gif)

### Compilation on save
![Compilation on save](./docs/assets/gifs/compileSave.gif)

### MIDI Input
![MIDI Input](./docs/assets/gifs/midiInput.gif)
Supports chord mode, relative mode and sharp/flat accidentals. See [DEMOS.md](./docs/DEMOS.md) for advanced features in action, and [SETTINGS.md](./docs/SETTINGS.md) on how to toggle them.

### MIDI Playback

![MIDI Playback](./docs/assets/gifs/midiPlayback.gif)

## Requirements

* [LilyPond](http://lilypond.org/) (Tested on 2.20.0)
* VSCode PDF previewer (Recommended: [vscode-pdf](https://marketplace.visualstudio.com/items?itemName=tomoki1207.pdf))
* (Optional) MIDI Devices for MIDI Input and Playback

## Extension Controls, Commands and Settings

* Commands: See [docs/COMMANDS.md](docs/COMMANDS.md)
* Settings: See [docs/SETTINGS.md](docs/SETTINGS.md)
* Status Bar interface: See [docs/STATUSBAR.md](docs/STATUSBAR.md)

## Known Issues
* Test-suite is in progress

Please submit issues in the GitHub repository.


## Contributing

Contributions are welcome, please submit issues/pull requests in the GitHub repository.

## Release Notes

### 1.0.0

Initial release

## Acknowledgements
Base syntax highlighting based on [original VSCode LilyPond extension](https://marketplace.visualstudio.com/items?itemName=truefire.lilypond) by Trudy Firestone, under the Creative Commons Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0) license (http://creativecommons.org/licenses/by-sa/3.0/). See that repository for additional acknowledgements.

License: Creative Commons Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0) license, http://creativecommons.org/licenses/by-sa/3.0/.