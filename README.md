# VSLilyPond

Provides syntax and error highlighting, compilation on save, MIDI (input and playback) support for [LilyPond](http://lilypond.org/) in VSCode. Works with any VSCode supported PDF previewer for PDF preview.

## Features

### Syntax and error highlighting 📜 
![Syntax and error highlighting](./docs/assets/gifs/syntaxHighlighting.gif)

### Compilation on save :floppy_disk:
![Compilation on save](./docs/assets/gifs/compileSave.gif)

### MIDI Input :musical_keyboard:
![MIDI Input](./docs/assets/gifs/midiInput.gif)
Supports chord mode, relative mode and sharp/flat accidentals. See [DEMOS.md](./docs/DEMOS.md) for advanced features in action, and [SETTINGS.md](./docs/SETTINGS.md) on how to toggle them.

### MIDI Playback :musical_score:

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

Please submit issues in the [Github repository](https://github.com/lhl2617/VSLilyPond)


## Contributing

* File bugs and/or feature requests in the [Github repository](https://github.com/lhl2617/VSLilyPond)
* Pull requests are welcome in the [Github repository](https://github.com/lhl2617/VSLilyPond)
* Buy me a Coffee :coffee: via [PayPal](https://paypal.me/lhl2617)

## Release Notes

### 1.0.3

* Add [truefire](https://marketplace.visualstudio.com/items?itemName=truefire.lilypond)'s VSCode extension as dependency
* Optimise MIDI playback to work even when no text editors are active
* Update documentation and GIFs
* Revert to non-webpack version 

### 1.0.2

Minor package.json changes

### 1.0.1

Minor touch up, use Webpack to optimise.

### 1.0.0

Initial release

## Acknowledgements
Base syntax highlighting depends on [LilyPond extension](https://marketplace.visualstudio.com/items?itemName=truefire.lilypond) by Trudy Firestone, under the Creative Commons Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0) license (http://creativecommons.org/licenses/by-sa/3.0/). See that repository for additional acknowledgements.

License: Creative Commons Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0) license, http://creativecommons.org/licenses/by-sa/3.0/.