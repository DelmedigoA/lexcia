import test from 'node:test';
import assert from 'node:assert/strict';
import {renderAnswer} from '../src/formatting.js';
test('hides source markers while preserving safe answer text',()=>{
 const output=renderAnswer('<script>alert(1)</script> [[SOURCE id=overview]] [[SOURCE id=unknown]]',[{item_id:'overview',title:'Overview'}]);
 assert.ok(!output.includes('<script>'));
 assert.ok(!output.includes('data-item-id'));
 assert.ok(!output.includes('SOURCE'));
 assert.ok(!output.includes('[1]'));
 assert.ok(!renderAnswer('Answer [[SOURCE id=over').includes('SOURCE'));
 assert.ok(!renderAnswer('[bad](javascript:alert(1))').includes('href="javascript:'));
});
