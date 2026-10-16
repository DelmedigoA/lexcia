import test from 'node:test';
import assert from 'node:assert/strict';
import {dayKey,dayLabel,timestamp,continuationQuestion,appendContinuation} from '../src/conversation-state.js';

test('chronology labels today and yesterday by calendar day, including year boundaries',()=>{
  const now=new Date(2026,0,1,12);
  assert.equal(dayLabel(new Date(2026,0,1,1),now),'Today');
  assert.equal(dayLabel(new Date(2025,11,31,23),now),'Yesterday');
  assert.notEqual(dayKey(new Date(2025,11,31)),dayKey(now));
});
test('old transcripts with no recorded timestamps do not acquire invented dates',()=>{
  for(const value of [undefined,null,'','not a date']){assert.equal(timestamp(value),null);assert.equal(dayKey(value),null);assert.equal(dayLabel(value),'');}
});
test('continuing before the first token resends the original question',()=>{
  assert.equal(continuationQuestion({question:'What is Lexcia?',answer:''}),'What is Lexcia?');
});
test('continuation includes the original question and the partial answer, within API character limits',()=>{
  const question='שאלה'.repeat(1000),answer='😀'.repeat(10000)+'latest unfinished sentence';
  const request=continuationQuestion({question,answer});
  assert.ok(Array.from(request).length<=4000);
  assert.ok(request.includes(question.slice(0,100)));
  assert.ok(request.endsWith('latest unfinished sentence'));
  assert.ok(!request.includes('\ufffd'));
});
test('continued text preserves the partial answer and handles whitespace at the join',()=>{
  assert.equal(appendContinuation('A partial answer','continued here.'),'A partial answer continued here.');
  assert.equal(appendContinuation('A partial answer\n','continued here.'),'A partial answer\ncontinued here.');
  assert.equal(appendContinuation('A partial answer',''),'A partial answer');
});
