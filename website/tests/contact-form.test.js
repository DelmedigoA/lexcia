import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_EMAIL,validateContactForm,contactMailto} from '../src/contact-form.js';
import {validateUI} from '../src/ui-schema.js';
import {followupSuggestions} from '../src/followup-suggestions.js';
const draft={email:'visitor@example.com',subject:'Lexcia for our museum & archive?',content:'Hello Lexcia,\nWe have Hebrew & English content. Can we talk?'};

test('contact handoff fixes the recipient and safely encodes the form values',()=>{
  assert.equal(validateContactForm(draft),null);
  const uri=new URL(contactMailto({...draft,to:'someone-else@example.com'}));
  assert.equal(uri.protocol,'mailto:');
  assert.equal(uri.pathname,CONTACT_EMAIL);
  assert.equal(uri.searchParams.get('subject'),draft.subject);
  assert.equal(uri.searchParams.get('body'),`Reply-to: ${draft.email}\n\n${draft.content}`);
  assert.deepEqual([...uri.searchParams.keys()],['subject','body']);
});
test('incomplete forms and injected email headers cannot be handed off',()=>{
  for(const patch of [{email:''},{email:'invalid'},{email:'a@example.com\r\nBcc:b@example.com'},{subject:''},{subject:'Hello\r\nBcc: another@example.com'},{subject:'a'.repeat(201)},{content:''},{content:'a'.repeat(4001)}]){
    assert.ok(validateContactForm({...draft,...patch}));
    assert.throws(()=>contactMailto({...draft,...patch}));
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
