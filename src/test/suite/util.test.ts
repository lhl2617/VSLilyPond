import * as assert from "assert"
import * as vscode from "vscode"
import { lilypondExists } from "../../util"

suite(`Util tests`, () => {
  vscode.window.showInformationMessage("Start Util tests.")

  test(`lilypondExists`, () => {
    // also checks that the extension can initialise successfully
    assert.strictEqual(lilypondExists(), true)
  })
})
