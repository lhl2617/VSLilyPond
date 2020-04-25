# Change Log

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