import * as assert from 'assert';

import * as vscode from 'vscode';
import { debugMode } from '../../consts';

/// make sure debugMode is false when deployed

suite(`Debug Test Suite`, () => {
    vscode.window.showInformationMessage('Start debug tests.');
    test(`debug - debugMode false`, () => {
        assert.equal(debugMode, false);
    });
});