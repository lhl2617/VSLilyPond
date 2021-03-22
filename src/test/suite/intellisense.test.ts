import * as assert from "assert"

import * as vscode from "vscode"
import { errMsgRegex } from "../../util"

suite(`Intellisense Test Suite`, () => {
  vscode.window.showInformationMessage("Start intellisense tests.")

  const tests: {
    name: string
    output: string
    want: string[][]
  }[] = [
    {
      name: "Normal error",
      output: [
        `././pathetique.ly:3:1: error: unknown escaped string: \`\\verson'`,
        ``,
        `\\verson "2.12.0"`,
        `././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting ',' or '.' or '='`,
        `\\verson "2.12.0`,
        `               "`,
      ].join(`\n`),
      want: [
        [
          `././pathetique.ly:3:1: error: unknown escaped string: \`\\verson'`,
          `././pathetique.ly`,
          `3`,
          `1`,
          `error`,
          `unknown escaped string: \`\\verson'`,
        ],
        [
          `././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting ',' or '.' or '='`,
          `././pathetique.ly`,
          `3`,
          `16`,
          `error`,
          `syntax error, unexpected STRING, expecting ',' or '.' or '='`,
        ],
      ],
    },
    {
      name: "Ignore header lines",
      output: [
        `GNU LilyPond`,
        `other junk`,
        `././pathetique.ly:3:1: error: unknown escaped string: \`\\verson'`,
        ``,
        `\\verson "2.12.0"`,
        `././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting ',' or '.' or '='`,
        `\\verson "2.12.0`,
        `               "`,
      ].join(`\n`),
      want: [
        [
          `././pathetique.ly:3:1: error: unknown escaped string: \`\\verson'`,
          `././pathetique.ly`,
          `3`,
          `1`,
          `error`,
          `unknown escaped string: \`\\verson'`,
        ],
        [
          `././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting ',' or '.' or '='`,
          `././pathetique.ly`,
          `3`,
          `16`,
          `error`,
          `syntax error, unexpected STRING, expecting ',' or '.' or '='`,
        ],
      ],
    },
    {
      name: "No errors",
      output: ``,
      want: [],
    },
    {
      name: "Ignore junk",
      output: [`GNU LilyPond`, `other junk`].join(`\n`),
      want: [],
    },
    {
      name: "Generic functionality test",
      output: [
        `1:2:3:4`,
        `5:6`,
        `78890.123`,
        `foo 123:456`,
        `barrrr`,
        `1:1`,
      ].join(`\n`),
      want: [],
    },
  ]

  for (const t of tests) {
    const { name, output, want } = t
    test(name, () => {
      const got: RegExpExecArray[] = []
      let curr: RegExpExecArray | null
      while ((curr = errMsgRegex.exec(output))) {
        got.push(curr)
      }
      assert.deepStrictEqual(JSON.stringify(got), JSON.stringify(want))
    })
  }
})
