# Change Log

## 1.3.0
- :heavy_exclamation_mark: Deprecated redundant commands, see [COMMANDS.md](./docs/COMMANDS.md).
- Fix bug in which warnings/errors in included files erroneously show in current file
- Include warnings from lilypond
- Enable settings to up to folder level
- Add feature to allow main file compilation

## 1.2.0
- Add icon
- Add configuration to let users set path to lilypond executable.

## 1.1.9
- Fix [\#36](https://github.com/lhl2617/VSLilyPond/issues/36)
    - Check for midi files by following the sequence: `.midi`, `.mid`, `audio.midi`
- Update dependencies

## 1.1.8
- Kill timeout for LilyPond spawns - might expose this as user configurable in the future
- Add note in README.md about active development
- Move extension back to preview mode
- Add warning to Catalina

## 1.1.7
- Make explicit minimum VSCode version
- Fallback storagePath to globalStoragePath for IntelliSense

## 1.1.6
- Add extension installation instructions

## 1.1.5
- Correct typo in documentation

## 1.1.4
- Added dependency for LilyPond AutoComplete (Commands & Keywords)

## 1.1.3
- Optimise process spawning by limiting one each for compilation and intellisense
- Code optimisations
- Using output channels for failing processes to notify user
- Added `Play from...` option for MIDI playback, allows user to input timestamp for MIDI to start from
- Only show status bar items for MIDI playback & input when options are valid

## 1.1.2
- Fix MIDI Input accepting messages that are not MIDI music messages (e.g. Modulation)

## 1.1.1
- Update documentation
- Add setup guide

## 1.1.0
- Refactored code base
- Added test suite

## 1.0.6-1.0.7
- Fix extension pointing to wrong build directory, causing it being unable to start up in some cases

## 1.0.3-1.0.5
- Add [truefire](https://marketplace.visualstudio.com/items?itemName=truefire.lilypond)'s VSCode extension as dependency
- Update documentation and GIFs
- Fix [#5](https://github.com/lhl2617/VSLilyPond/issues/5), revert to non-webpack version.
- Remove unneeded files

## 1.0.2
- Minor package.json changes

## 1.0.1 
- Clean up development items
- Use webpack to optimise extension

## 1.0.0
- Initial release
