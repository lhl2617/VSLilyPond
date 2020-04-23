import * as assert from 'assert';
import * as vscode from 'vscode';

import { MIDIOut } from '../../midiOut';

suite(`MIDIOut test suite`, () => {
	vscode.window.showInformationMessage('Start MIDIOut tests.');
    test(`msToMMSS test 1 - 0`, () => {
        const ms = 0;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `0:00`;
        
        assert.equal(got, exp);
    });

    test(`msToMMSS test 2 - almost 1 sec`, () => {
        const ms = 999;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `0:01`;
        
        assert.equal(got, exp);
    });
    
    test(`msToMMSS test 3 - exactly 1 sec`, () => {
        const ms = 1000;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `0:01`;
        
        assert.equal(got, exp);
    });
    
    test(`msToMMSS test 3 - bit more than 1 sec`, () => {
        const ms = 1001;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `0:01`;
        
        assert.equal(got, exp);
    });

    test(`msToMMSS test 4 - 1 min`, () => {
        const ms = 60000;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `1:00`;
        
        assert.equal(got, exp);
    });
    
    test(`msToMMSS test 4 - large number`, () => {
        const ms = 6023000;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `100:23`;
        
        assert.equal(got, exp);
    });
    
    test(`msToMMSS test 5 - negative time exception`, () => {
        const ms = -1;
        const expectThrow = () => MIDIOut.msToMMSS(ms);
        
        assert.throws(expectThrow, new Error(`Time cannot be negative`));
    });
});
