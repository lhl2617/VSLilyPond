import * as assert from 'assert';
import * as vscode from 'vscode';

import { MIDIOut } from '../../midiOut';

suite(`MIDIOut test suite`, () => {
	vscode.window.showInformationMessage('Start MIDIOut tests.');
    test(`msToMMSS - 0`, () => {
        const ms = 0;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `0:00`;
        
        assert.strictEqual(got, exp);
    });

    test(`msToMMSS - almost 1 sec`, () => {
        const ms = 999;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `0:01`;
        
        assert.strictEqual(got, exp);
    });
    
    test(`msToMMSS - exactly 1 sec`, () => {
        const ms = 1000;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `0:01`;
        
        assert.strictEqual(got, exp);
    });
    
    test(`msToMMSS - bit more than 1 sec`, () => {
        const ms = 1001;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `0:01`;
        
        assert.strictEqual(got, exp);
    });

    test(`msToMMSS - 1 min`, () => {
        const ms = 60000;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `1:00`;
        
        assert.strictEqual(got, exp);
    });
    
    test(`msToMMSS - large number`, () => {
        const ms = 6023000;
        const got = MIDIOut.msToMMSS(ms);
        const exp = `100:23`;
        
        assert.strictEqual(got, exp);
    });
    
    test(`msToMMSS - negative time exception`, () => {
        const ms = -1;
        const expectThrow = () => MIDIOut.msToMMSS(ms);
        
        assert.throws(expectThrow, new Error(`Time cannot be negative`));
    });

    test(`MMSSToms - exception empty string`, () => {
        const mmss = ``;
        const expectThrow = () => MIDIOut.MMSSToms(mmss);
        
        assert.throws(expectThrow,new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`));
    });
    
    test(`MMSSToms - exception number`, () => {
        const mmss = `12`;
        const expectThrow = () => MIDIOut.MMSSToms(mmss);
        
        assert.throws(expectThrow,new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`));
    });
    
    test(`MMSSToms - exception number 2`, () => {
        const mmss = `11232`;
        const expectThrow = () => MIDIOut.MMSSToms(mmss);
        
        assert.throws(expectThrow,new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`));
    });
    
    test(`MMSSToms - exception 0:0`, () => {
        const mmss = `0:0`;
        const expectThrow = () => MIDIOut.MMSSToms(mmss);
        
        assert.throws(expectThrow,new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`));
    });

    test(`MMSSToms - exception 0:60`, () => {
        const mmss = `0:60`;
        const expectThrow = () => MIDIOut.MMSSToms(mmss);
        
        assert.throws(expectThrow,new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`));
    });

    test(`MMSSToms - exception 0:000`, () => {
        const mmss = `0:000`;
        const expectThrow = () => MIDIOut.MMSSToms(mmss);
        
        assert.throws(expectThrow,new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`));
    });

    test(`MMSSToms - exception 0:012`, () => {
        const mmss = `0:012`;
        const expectThrow = () => MIDIOut.MMSSToms(mmss);
        
        assert.throws(expectThrow,new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`));
    });

    test(`MMSSToms - exception 0:012`, () => {
        const mmss = `0:012`;
        const expectThrow = () => MIDIOut.MMSSToms(mmss);
        
        assert.throws(expectThrow,new Error(`${mmss} does not match the required syntax: \/\^[0-9]+:[0-5][0-9]\$\/. Valid examples: 1:23, 10:59, 0:12`));
    });

    test(`MMSSToms - valid 1`, () => {
        const mmss = `0:00`;
        const got = MIDIOut.MMSSToms(mmss);
        const exp = 0;

        assert.strictEqual(got, exp);
    });

    test(`MMSSToms - valid 2`, () => {
        const mmss = `0:59`;
        const got = MIDIOut.MMSSToms(mmss);
        const exp = 59000;

        assert.strictEqual(got, exp);
    });
    
    test(`MMSSToms - valid 3`, () => {
        const mmss = `1:00`;
        const got = MIDIOut.MMSSToms(mmss);
        const exp = 60000;

        assert.strictEqual(got, exp);
    });
    
    test(`MMSSToms - valid 4`, () => {
        const mmss = `123:34`;
        const got = MIDIOut.MMSSToms(mmss);
        const exp = 7414000;

        assert.strictEqual(got, exp);
    });

    test(`validateMIDIStartTimeInput - exception longer`, () => {
        const durationMS = 1999;
        const mmss = '0:02';
        const durationMMSS = MIDIOut.msToMMSS(durationMS);

        const got = MIDIOut.validateMIDIStartTimeInput(durationMS, durationMMSS, mmss);
        const exp = `Duration ${mmss} is longer than duration of actual MIDI file ${durationMMSS}`;

        assert.strictEqual(got, exp);
    });
    

    test(`validateMIDIStartTimeInput - valid 1`, () => {
        const durationMS = 2000;
        const mmss = '0:02';
        const durationMMSS = MIDIOut.msToMMSS(durationMS);

        const got = MIDIOut.validateMIDIStartTimeInput(durationMS, durationMMSS, mmss);
        const exp = undefined;

        assert.strictEqual(got, exp);
    });

    test(`validateMIDIStartTimeInput - valid 2`, () => {
        const durationMS = 2001;
        const mmss = '0:02';
        const durationMMSS = MIDIOut.msToMMSS(durationMS);

        const got = MIDIOut.validateMIDIStartTimeInput(durationMS, durationMMSS, mmss);
        const exp = undefined;

        assert.strictEqual(got, exp);
    });
});
