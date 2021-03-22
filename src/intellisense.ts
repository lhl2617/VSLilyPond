import * as vscode from "vscode"
import * as cp from "child_process"
import * as path from "path"
import {
  logger,
  getBinPath,
  LogLevel,
  getConfiguration,
  errMsgRegex,
} from "./util"
import { langId } from "./consts"
import * as fs from "fs"

// 1.1.11: Overhauled script based on
// https://github.com/nwhetsell/linter-lilypond/blob/master/lib/linter-lilypond.coffee

// INTELLISENSE

export type DiagnosticInfo = {
  uri: vscode.Uri
  range: vscode.Range
  severity: vscode.DiagnosticSeverity
  errMsg: string
}

let intellisenseOutputChannel: vscode.OutputChannel | undefined = undefined
let intellisenseProcess:
  | cp.ChildProcessWithoutNullStreams
  | undefined = undefined
let timeout: NodeJS.Timeout | undefined = undefined

// make ready an output channel
const initIntellisense = () => {
  intellisenseOutputChannel = vscode.window.createOutputChannel(
    `VSLilyPond: Intellisense`
  )
}

const outputToChannel = async (msg: string, show = false) => {
  if (intellisenseOutputChannel) {
    intellisenseOutputChannel.appendLine(msg)
    if (show) {
      intellisenseOutputChannel.show(true)
    }
  } else {
    logger(
      `Unable to output to Intellisense OutputChannel, ${msg}`,
      LogLevel.warning,
      true
    )
  }
}

const triggerIntellisense = async (
  doc: vscode.TextDocument,
  diagCol: vscode.DiagnosticCollection
) => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = undefined
  }
  timeout = setTimeout(() => execIntellisense(doc, diagCol), 500)
}

const getDiagSeverity = (s: string): vscode.DiagnosticSeverity => {
  switch (s) {
    case `error`:
      return vscode.DiagnosticSeverity.Error
    case `warning`:
      return vscode.DiagnosticSeverity.Warning
    default:
      return vscode.DiagnosticSeverity.Error
  }
}

const addToDiagCol = (
  diag: DiagnosticInfo,
  diagCol: vscode.DiagnosticCollection
) => {
  const { uri, severity, range, errMsg } = diag
  const diagnostic: vscode.Diagnostic = {
    severity: severity,
    range: range,
    message: errMsg,
  }
  const currentDiags = diagCol.get(uri) ?? []

  const newDiags = currentDiags.concat(diagnostic)

  diagCol.set(uri, newDiags)
}

const processIntellisenseErrors = async (
  output: string,
  doc: vscode.TextDocument,
  diagCol: vscode.DiagnosticCollection
) => {
  let errGroup: RegExpExecArray | null = null
  while ((errGroup = errMsgRegex.exec(output))) {
    try {
      // send the diagnostics to the correct file
      const getUri = (gotPath: string) => {
        // need to differentiate between included file and local
        if (gotPath === `-`) {
          return doc.uri
        }
        // got an absolute path
        else if (path.isAbsolute(gotPath) && fs.existsSync(gotPath)) {
          return vscode.Uri.file(gotPath)
        }
        // got a relative path
        else if (
          fs.existsSync(path.join(path.dirname(doc.uri.fsPath), gotPath))
        ) {
          const absPath = path.join(path.dirname(doc.uri.fsPath), gotPath)
          return vscode.Uri.file(absPath)
        } else {
          throw new Error(`Error in \`${gotPath}\``)
        }
      }

      const uri = getUri(errGroup[1])
      const lineNo = Number.parseInt(errGroup[2], 10) - 1
      const charNo = Number.parseInt(errGroup[3], 10) - 1
      const severity = getDiagSeverity(errGroup[4])
      const errMsg = errGroup[5]

      const diag: DiagnosticInfo = {
        uri: uri,
        severity: severity,
        range: new vscode.Range(lineNo, 0, lineNo, charNo),
        errMsg: errMsg,
      }

      addToDiagCol(diag, diagCol)
    } catch (err) {
      outputToChannel(`Intellisense error: ${err.message}, ${output}`, true)
    }
  }
}

// intellisense produces a midi file `-.tmp`. Delete this if exists
const clearTmpMidiFile = async (dirName: string) => {
  const midiFilePath = path.join(dirName, `-.tmp`)

  if (fs.existsSync(midiFilePath)) {
    fs.unlinkSync(midiFilePath)
    // logger(`Removed tmp midi file`, LogLevel.info, true);
  }
}

const execIntellisense = async (
  doc: vscode.TextDocument,
  diagCol: vscode.DiagnosticCollection
) => {
  try {
    diagCol.clear()

    const config = getConfiguration(doc)
    const binPath = getBinPath()

    const additionalArgs: string[] = config.compilation.additionalCommandLineArguments
      .trim()
      .split(/\s+/)

    // notice that this produces a midi file titled `-.mid`.
    // it is possible to set output to filePath, but then the --include gets broken...
    const intellisenseArgs = [
      `--loglevel=WARNING`, // Output errors and warnings
      `--define-default=backend=null`, // to not output printed score
      `-dmidi-extension=tmp`, // show midi output as -.tmp
      `-`, // read input from stdin
    ]

    const args = additionalArgs.concat(intellisenseArgs) // intellisense args must come after as they overwrite prior args

    if (intellisenseProcess) {
      intellisenseProcess.kill(`SIGKILL`)
      intellisenseProcess = undefined
    }

    intellisenseProcess = cp.spawn(binPath, args, {
      cwd: path.dirname(doc.uri.fsPath),
    })

    intellisenseProcess.stdin.write(doc.getText())

    intellisenseProcess.stdin.end()

    intellisenseProcess.stdout.on("data", (data) => {
      logger(`Intellisense: no errors, ${data}`, LogLevel.info, true)
    })

    intellisenseProcess.stderr.on("data", (data) => {
      processIntellisenseErrors(data.toString(), doc, diagCol)
    })

    intellisenseProcess.on("close", (code) => {
      logger(
        `Intellisense process exited with code ${code}`,
        LogLevel.info,
        true
      )
      intellisenseProcess = undefined

      clearTmpMidiFile(path.dirname(doc.uri.fsPath))
    })
  } catch (err) {
    const errMsg = `Intellisense failed with error ${err.message}`
    logger(errMsg, LogLevel.error, true)
    outputToChannel(errMsg, true)
  }
}

export const subscribeIntellisense = (
  context: vscode.ExtensionContext,
  diagCol: vscode.DiagnosticCollection
) => {
  initIntellisense()
  if (
    vscode.window.activeTextEditor &&
    vscode.window.activeTextEditor.document.languageId === langId
  ) {
    triggerIntellisense(vscode.window.activeTextEditor.document, diagCol)
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && editor.document.languageId === langId) {
        triggerIntellisense(editor.document, diagCol)
      }
    })
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === langId) {
        triggerIntellisense(e.document, diagCol)
      }
    })
  )

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => diagCol.delete(doc.uri))
  )
}
