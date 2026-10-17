import test from 'node:test';
import assert from 'node:assert/strict';
import {followupSuggestions,isSchedulingRequest} from '../src/followup-suggestions.js';
const suggestions=[{prompt:'How could Lexcia help our museum visitors?',action:'ask'},{prompt:'Explore a demo for my website',action:'schedule_demo'}];
const reply={question:'We run a museum website',status:'complete',suggestions};
test('follow-ups preserve model-written prompts and actions, with no fixed fallback',()=>{
  assert.deepEqual(followupSuggestions([reply]),suggestions);
  assert.deepEqual(followupSuggestions([{...reply,suggestions:undefined}]),[]);
});
test('empty, running, failed and scheduling turns do not show follow-ups',()=>{
  for(const turns of [[],[{...reply,status:'running'}],[{...reply,status:'error'}],[{...reply,scheduling:{step:'form'}}]])assert.deepEqual(followupSuggestions(turns),[]);
});
test('an open draft or refusal suppresses only the model demo action',()=>{
  const draft={status:'complete',scheduling:{step:'review'},question:'Schedule a demo'};
  assert.deepEqual(followupSuggestions([draft,reply]),[suggestions[0]]);
  assert.deepEqual(followupSuggestions([{question:'I don’t want a demo'},reply]),[suggestions[0]]);
});
test('model language is preserved, and malformed or duplicate suggestions are rejected',()=>{
  const he={prompt:'איך זה יעזור למבקרי המוזיאון שלנו?',action:'ask'};
  assert.deepEqual(followupSuggestions([{...reply,suggestions:[he,he,{prompt:'',action:'ask'},{prompt:'Bad',action:'execute'},null]}]),[he]);
});

test('model action routes differently worded demo buttons and preserves learning questions',()=>{
  assert.equal(isSchedulingRequest([reply],'Explore a demo for my website'),true);
  const learning={prompt:'What should I prepare before I book a demo?',action:'ask'};
  assert.equal(isSchedulingRequest([{...reply,suggestions:[learning]}],learning.prompt),false);
  assert.equal(isSchedulingRequest([],'Schedule a demo'),true);
});
