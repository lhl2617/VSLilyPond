import * as assert from 'assert';

import * as vscode from 'vscode';
import { errMsgRegex } from '../../util';

suite(`Intellisense Test Suite`, () => {
    vscode.window.showInformationMessage('Start intellisense tests.');
    test(`groupErrors - normal error`, () => {
        const output =
            [
                `././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
                ``,
                `\\verson \"2.12.0\"`,
                `././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
                `\\verson \"2.12.0`,
                `               \"`
            ].join(`\n`);

        let got: RegExpExecArray[] = [];
        let curr: RegExpExecArray | null;
        while (curr = errMsgRegex.exec(output)) {
            got.push(curr);
        }

        const exp = [
            [
                `././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
                `././pathetique.ly`,
                `3`,
                `1`,
                `error`,
                `unknown escaped string: \`\\verson\'`
            ],
            [
                `././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
                `././pathetique.ly`,
                `3`,
                `16`,
                `error`,
                `syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`
            ]
        ];

        assert.deepStrictEqual(JSON.stringify(got), JSON.stringify(exp));
    });

    test(`groupErrors - ignore header lines`, () => {
        const output =
            [
                `GNU LilyPond`,
                `other junk`,
                `././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
                ``,
                `\\verson \"2.12.0\"`,
                `././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
                `\\verson \"2.12.0`,
                `               \"`
            ].join(`\n`);

        let got: RegExpExecArray[] = [];
        let curr: RegExpExecArray | null;
        while (curr = errMsgRegex.exec(output)) {
            got.push(curr);
        }
        const exp = [
            [
                `././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
                `././pathetique.ly`,
                `3`,
                `1`,
                `error`,
                `unknown escaped string: \`\\verson\'`
            ],
            [
                `././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
                `././pathetique.ly`,
                `3`,
                `16`,
                `error`,
                `syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`
            ]
        ];
        assert.deepStrictEqual(JSON.stringify(got), JSON.stringify(exp));
    });

    test(`groupErrors - no errors`, () => {
        const output = ``;

        let got: RegExpExecArray[] = [];
        let curr: RegExpExecArray | null;
        while (curr = errMsgRegex.exec(output)) {
            got.push(curr);
        }
        const exp: string[][] = [];
        assert.deepStrictEqual(JSON.stringify(got), JSON.stringify(exp));
    });

    test(`groupErrors - ignore junk`, () => {
        const output =
            [
                `GNU LilyPond`,
                `other junk`
            ].join(`\n`);;

        let got: RegExpExecArray[] = [];
        let curr: RegExpExecArray | null;
        while (curr = errMsgRegex.exec(output)) {
            got.push(curr);
        }
        const exp: string[][] = [];
        assert.deepStrictEqual(JSON.stringify(got), JSON.stringify(exp));
    });

    test(`groupErrors - generic functionality test`, () => {
        const output =
            [
                `1:2:3:4`,
                `5:6`,
                `78890.123`,
                `foo 123:456`,
                `barrrr`,
                `1:1`
            ].join(`\n`);;

        let got: RegExpExecArray[] = [];
        let curr: RegExpExecArray | null;
        while (curr = errMsgRegex.exec(output)) {
            got.push(curr);
        }
        const exp: string[][] = [];
        assert.deepStrictEqual(JSON.stringify(got), JSON.stringify(exp));
    });
});