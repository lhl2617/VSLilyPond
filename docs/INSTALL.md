# Setup Guide

## Requirements
 
* [VSCode](https://code.visualstudio.com/) 1.44.0 minimum 
* [LilyPond](http://lilypond.org/) (Tested on 2.20.0)
* (Optional) MIDI Devices for MIDI Input and Playback

## [VSLilyPond](https://marketplace.visualstudio.com/items?itemName=lhl2617.vslilypond) Extension Setup Guide

1. Open the Extensions left panel in VSCode (Windows: Ctrl+Shift+X; MacOS: Cmd+Shift+X).
2. Type in `VsLilyPond` in the search bar.
3. Install the extension, then reload VSCode.

## [LilyPond](http://lilypond.org/) Setup Guide

1. Go to the [LilyPond Downloads page](https://lilypond.org/download.html).
2. Under "For users", choose your OS.
3. Under "Packages", download the installation package and install LilyPond.
4. [MacOS X and Windows only]
    - Option (a)
        - Follow the instructions under "Running on the command-line" to set LilyPond to run on your command line. This involves adding the `lilypond` executable to your command line.
    - Option (b)
        - Set your path to `lilypond` executable in Settings. See [vslilypond.general.pathToLilypond](SETTINGS.md#vslilypond.general.pathToLilypond).


Note: macOS Catalina (10.15) (and newer) does not support 32-bit applications--please use the 64-bit download link for LilyPond.

LilyPond Manuals and Guides can be found on [lilypond.org](http://lilypond.org).

## python-ly Setup Guide (Required for formatting)

1. Run `python -m pip install python-ly`, where `python` is your Python 3 installation.
Note: more information [here](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-formatter), including if your Python 3 installation is different.

## LilyPond PDF Preview Usage Guide

See [here](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-pdf-preview).

