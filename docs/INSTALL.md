# Setup Guide

## Requirements

* [LilyPond](http://lilypond.org/) (Tested on 2.20.0)
* VSCode PDF previewer (Recommended: [vscode-pdf](https://marketplace.visualstudio.com/items?itemName=tomoki1207.pdf))
* (Optional) MIDI Devices for MIDI Input and Playback

## [VSLilyPond](https://marketplace.visualstudio.com/items?itemName=lhl2617.vslilypond) Extension Setup Guide

1. Open the Extensions left panel in VSCode (Windows: Ctrl+Shift+X; MacOS: Cmd+Shift+X).
2. Type in `VsLilyPond` in the search bar.
3. Install the extension, then reload VSCode.

## [LilyPond](http://lilypond.org/) Setup Guide

1. Go to the [LilyPond Downloads page](https://lilypond.org/download.html).
2. Under "For users", choose your OS.
3. Under "Packages", download the installation package and install LilyPond.
4. [MacOS X and Windows only] Follow the instructions under "Running on the command-line" to set LilyPond to run on your command line.
5. To test your LilyPond installation, make sure you can run LilyPond by typing `lilypond` on any terminal/shell.

LilyPond Manuals and Guides can be found on [lilypond.org](http://lilypond.org).

## VSCode PDF previewer Setup & Usage Guide

1. Install the [vscode-pdf](https://marketplace.visualstudio.com/items?itemName=tomoki1207.pdf) extension via the link.
2. Open a valid LilyPond file and compile it (via the Command Palette, or, if you have compile-on-save enabled, save the file).
3. A `.pdf` file should be generated when compilation completes.
4. You should be able to live preview the PDF in VSCode.

