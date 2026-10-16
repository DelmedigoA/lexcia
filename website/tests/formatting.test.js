import test from 'node:test';
import assert from 'node:assert/strict';
import {renderAnswer,stripSourceMarkers} from '../src/formatting.js';

test('hides source markers while preserving safe answer text',()=>{
 const output=renderAnswer('<script>alert(1)</script> [[SOURCE id=overview]] [[SOURCE id=unknown]]',[{item_id:'overview',title:'Overview'}]);
 assert.ok(!output.includes('<script>'));
 assert.ok(!output.includes('data-item-id'));
 assert.ok(!output.includes('SOURCE'));
 assert.ok(!output.includes('[1]'));
 assert.ok(!renderAnswer('Answer [[SOURCE id=over').includes('SOURCE'));
 assert.ok(!renderAnswer('[bad](javascript:alert(1))').includes('href="javascript:'));
});

test('copied answers exclude complete and partially streamed source markers while preserving markdown and Hebrew',()=>{
  assert.equal(stripSourceMarkers('שלום **Lexcia**. [[SOURCE id=overview]]\n`Thread`'),'שלום **Lexcia**. \n`Thread`');
  assert.equal(stripSourceMarkers('An answer. [[SOURCE id=over'),'An answer. ');
});

test('answer markdown supports code and lists without accepting HTML or javascript links',()=>{
  const html=renderAnswer('Use `Thread`.\n\n- First\n- Second\n\n```js\nconst x = "<script>";\n```\n\n<img src=x onerror=alert(1)>\n[unsafe](javascript:alert(1))');
  assert.match(html,/<code>Thread<\/code>/);
  assert.match(html,/<ul>/);
  assert.match(html,/<code class="language-js">/);
  assert.doesNotMatch(html,/<img|<script|href="javascript:/);
});
