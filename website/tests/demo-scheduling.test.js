import test from 'node:test';
import assert from 'node:assert/strict';
import {isDemoSchedulingQuestion,localDateValue,validateDemoDraft} from '../src/demo-scheduling.js';
test('explicit scheduling requests work without intercepting general product questions',()=>{
  for(const text of ['Schedule a demo','Can I book a demo?','I want to arrange a demonstration','אפשר לתאם דמו?'])assert.equal(isDemoSchedulingQuestion(text),true,text);
  for(const text of ['What is Lexcia?','How does pricing work?','Can I try the demo?',"Please don’t schedule a demo",'לא רוצה לתאם דמו'])assert.equal(isDemoSchedulingQuestion(text),false,text);
});
test('demo preferences reject past and impossible dates and accept a future local time',()=>{
  const now=new Date(2026,9,18,10,0);
  const draft={name:'Test Visitor',email:'visitor@example.com',date:'2026-10-19',time:'14:00'};
  assert.equal(validateDemoDraft(draft,now),'');
  assert.match(validateDemoDraft({...draft,date:'2026-10-17'},now),/future/);
  assert.match(validateDemoDraft({...draft,date:'2026-02-30'},now),/valid/);
  assert.match(validateDemoDraft({...draft,email:'invalid'},now),/email/);
  assert.match(validateDemoDraft({...draft,time:'25:00'},now),/valid/);
  assert.equal(localDateValue(now),'2026-10-18');
});
