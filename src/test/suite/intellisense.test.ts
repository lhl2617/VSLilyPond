// import * as assert from 'assert';

// import * as vscode from 'vscode';
// import { groupErrors, getDiagError, DiagErrorInfo } from '../../intellisense';

// suite(`Intellisense Test Suite`, () => {
// 	vscode.window.showInformationMessage('Start intellisense tests.');
// 	test(`groupErrors - normal error`, () => {
// 		const output =
// 			[
// 				`././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
// 				``,
// 				`\\verson \"2.12.0\"`,
// 				`././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
// 				`\\verson \"2.12.0`,
// 				`               \"`
// 			].join(`\n`);

// 		const got = groupErrors(output);
// 		const exp = [
// 			[
// 				`././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
// 				``,
// 				`\\verson \"2.12.0\"`
// 			],
// 			[
// 				`././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
// 				`\\verson \"2.12.0`,
// 				`               \"`
// 			]
// 		];
// 		assert.equal(JSON.stringify(got), JSON.stringify(exp));
// 	});

// 	test(`groupErrors - ignore header lines`, () => {
// 		const output =
// 			[
// 				`GNU LilyPond`,
// 				`other junk`,
// 				`././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
// 				``,
// 				`\\verson \"2.12.0\"`,
// 				`././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
// 				`\\verson \"2.12.0`,
// 				`               \"`
// 			].join(`\n`);

// 		const got = groupErrors(output);
// 		const exp =
// 			[
// 				[
// 					`././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
// 					``,
// 					`\\verson \"2.12.0\"`
// 				],
// 				[
// 					`././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
// 					`\\verson \"2.12.0`,
// 					`               \"`
// 				]
// 			];
// 		assert.equal(JSON.stringify(got), JSON.stringify(exp));
// 	});

// 	test(`groupErrors - no errors`, () => {
// 		const output = ``;

// 		const got = groupErrors(output);
// 		const exp: string[][] = [];
// 		assert.deepEqual(got, exp);
// 	});

// 	test(`groupErrors - ignore junk`, () => {
// 		const output =
// 			[
// 				`GNU LilyPond`,
// 				`other junk`
// 			].join(`\n`);;

// 		const got = groupErrors(output);
// 		const exp: string[][] = [];
// 		assert.equal(JSON.stringify(got), JSON.stringify(exp));
// 	});

// 	test(`groupErrors - generic functionality test`, () => {
// 		const output =
// 			[
// 				`1:2:3:4`,
// 				`5:6`,
// 				`78890.123`,
// 				`foo 123:456`,
// 				`barrrr`,
// 				`1:1`
// 			].join(`\n`);;

// 		const got = groupErrors(output);
// 		const exp: string[][] =
// 			[
// 				[`1:2:3:4`],
// 				[`5:6`,
// 					`78890.123`],
// 				[`foo 123:456`,
// 					`barrrr`],
// 				[`1:1`]
// 			];
// 		assert.equal(JSON.stringify(got), JSON.stringify(exp));
// 	});

// 	test(`getDiagError - normal error 1`, () => {
// 		const errGroup = [
// 			`././pathetique.ly:3:1: error: unknown escaped string: \`\\verson\'`,
// 			``,
// 			`\\verson \"2.12.0\"`
// 		];

// 		const got = getDiagError(errGroup);

// 		const exp: DiagErrorInfo = {
// 			lineNo: 2,
// 			charNo: 1,
// 			error: [
// 				`error: unknown escaped string: \`\\verson\'`,
// 				``,
// 				`\\verson \"2.12.0\"`
// 			].join(`\n`)
// 		};

// 		assert.deepEqual(got, exp);
// 	});

// 	test(`getDiagError - normal error 2`, () => {
// 		const errGroup =
// 			[
// 				`././pathetique.ly:3:16: error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
// 				`\\verson \"2.12.0`,
// 				`               \"`
// 			];

// 		const got = getDiagError(errGroup);

// 		const exp: DiagErrorInfo = {
// 			lineNo: 2,
// 			charNo: 16,
// 			error: [
// 				`error: syntax error, unexpected STRING, expecting \',\' or \'.\' or \'=\'`,
// 				`\\verson \"2.12.0`,
// 				`               \"`
// 			].join(`\n`)
// 		};

// 		assert.deepEqual(got, exp);
// 	});

// 	test(`getDiagError - empty error group exception`, () => {
// 		const errGroup: string[] = [];

// 		const expectThrow = () => getDiagError(errGroup);

// 		assert.throws(expectThrow, new Error(`Error group is empty!`));
// 	});

// 	test(`getDiagError - cannot match error group`, () => {
// 		const errGroup: string[] = [``];

// 		const expectThrow = () => getDiagError(errGroup);

// 		assert.throws(expectThrow, new Error(`Error group does not match lineNo:charNo format!`));
// 	});
// });