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

test('section links preserve natural inline wording and styling without favicon chips',()=>{
  const html=renderAnswer('You can read more [about us](#about).\n\nSee [who it’s for](#for) and our [customization options](#offer).');
  assert.match(html,/<a href="#about" class="section-link">about us<\/a>/);
  assert.match(html,/<a href="#for" class="section-link">who it’s for<\/a>/);
  assert.match(html,/<a href="#offer" class="section-link">customization options<\/a>/);
  assert.doesNotMatch(html,/<img|data-slot|target="_blank"/);
  assert.match(renderAnswer('[Book a call](#schedule-demo)'),/>Book a call<\/a>/);
  assert.match(renderAnswer('[עלינו](#about)'),/class="section-link">עלינו<\/a>/);
  const ordinary=renderAnswer('[Other](#unknown) [External](https://example.com)');
  assert.doesNotMatch(ordinary,/class="section-link"/);
  assert.match(ordinary,/>External<\/a>/);
});
