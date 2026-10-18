import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_EMAIL,validateContactForm} from '../src/contact-form.js';
import {validateUI} from '../src/ui-schema.js';
import {followupSuggestions} from '../src/followup-suggestions.js';
const draft={email:'visitor@example.com',subject:'Lexcia for our museum & archive?',content:'Hello Lexcia,\nWe have Hebrew & English content. Can we talk?'};

test('valid contact fields are accepted for the local preview',()=>assert.equal(validateContactForm(draft),null));
test('incomplete forms and invalid field values are rejected',()=>{
  for(const patch of [{email:''},{email:'invalid'},{email:'a@example.com\r\nBcc:b@example.com'},{subject:''},{subject:'Hello\r\nBcc: another@example.com'},{subject:'a'.repeat(201)},{content:''},{content:'a'.repeat(4001)}]){
    assert.ok(validateContactForm({...draft,...patch}));
  }
});
test('contact renderer only accepts the confirmed recipient and plain fields',()=>{
  const tree={$type:'ContactForm',title:'Contact Lexcia',to:CONTACT_EMAIL,language:'en'};
  assert.ok(validateUI(tree));
  assert.throws(()=>validateUI({...tree,to:'attacker@example.com'}));
  assert.throws(()=>validateUI({...tree,onSend:'fetch("/send")'}));
});
test('contact form turns do not show proactive follow-up actions',()=>{
  assert.deepEqual(followupSuggestions([{status:'complete',ui:{$type:'ContactForm'},suggestions:[{prompt:'Schedule a demo',action:'schedule_demo'}]}]),[]);
});
