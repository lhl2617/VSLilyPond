# Change Log

## 1.7.0
- Fix [#341](https://github.com/lhl2617/VSLilyPond/issues/341)
  - Thanks [paradox460](https://github.com/paradox460)
- Update dependencies

## 1.6.5
- Fix [#253](https://github.com/lhl2617/VSLilyPond/issues/253)
  - Kill the previous compilation job and let the next one take over
- Fix [#252](https://github.com/lhl2617/VSLilyPond/issues/252)
  - Add a `Compiling...` status bar icon as well as a Compilation Failed one to signify status.
- Fail more predictably on MIDI input and output
  - For input, fail when no input devices are found
  - For output, show the status bar items more leniently (all LilyPond files)
    - Fail when MIDI file not found with a more descriptive message.

## 1.6.4
- Update dependencies
  - Fix an issue with remote servers/dev containers crashing due to the absence of sound devices in a Linux based container
    - https://github.com/jazz-soft/JZZ/issues/43

## 1.6.3
- Update documentation

## 1.6.2
- Output `lilypond` compilation stdout and stderr to the `VSLilyPond: Compilation` output channel.

## 1.6.1
- Update documentation

## 1.6.0
- Use [LilyPond PDF Preview](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-pdf-preview) extension which supports Point-and-Click.

## 1.5.6
- Update documentation

## 1.5.5
- Update dependencies
- Update documentation

## 1.5.4
- Use [LilyPond Syntax](https://marketplace.visualstudio.com/items?itemName=jeandeaual.lilypond-syntax) extension which supports Scheme syntax for syntax highlighting
- Update dependencies

## 1.5.3
- Add StatusBarItem showing loaded LilyPond version
- Update dependencies

## 1.5.2
- Temporarily remove `jeandeaual.lilypond-syntax` as it causes VSLilyPond to not be able to start up.

## 1.5.1
- Take extension out of preview
- Fix typos in README

## 1.5.0
- Use [LilyPond Syntax](https://marketplace.visualstudio.com/items?itemName=jeandeaual.lilypond-syntax) extension which supports Scheme syntax for syntax highlighting
- Update dependencies

## 1.4.3
- Update dependencies
- Refactor tests

## 1.4.2
- Update dependencies
- Fix #168: status bar was not working due to missed items when the extension namespace was changed.

## 1.4.0
- Update dependencies
- Add [formatter](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-formatter)

## 1.3.2
- Update dependencies
- Change namespace of extension commands to prevent clashing.

## 1.3.1
- Minify images
- Bumped dependency versions
- Update icon

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
