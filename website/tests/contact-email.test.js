import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_EMAIL,validateContactDraft,contactMailto} from '../src/contact-email.js';
import {validateUI} from '../src/ui-schema.js';
import {followupSuggestions} from '../src/followup-suggestions.js';
const draft={from:'visitor@example.com',subject:'Lexcia for our museum & archive?',body:'Hello Lexcia,\nWe have Hebrew & English content. Can we talk?'};

test('contact handoff fixes the recipient and safely encodes the visitor draft',()=>{
  assert.equal(validateContactDraft(draft),null);
  const uri=new URL(contactMailto({...draft,to:'someone-else@example.com'}));
  assert.equal(uri.protocol,'mailto:');
  assert.equal(uri.pathname,CONTACT_EMAIL);
  assert.equal(uri.searchParams.get('subject'),draft.subject);
  assert.equal(uri.searchParams.get('body'),`Reply-to: ${draft.from}\n\n${draft.body}`);
  assert.deepEqual([...uri.searchParams.keys()],['subject','body']);
});
test('incomplete drafts and injected email headers cannot be handed off',()=>{
  for(const patch of [{from:''},{from:'invalid'},{from:'a@example.com\r\nBcc:b@example.com'},{subject:''},{subject:'Hello\r\nBcc: another@example.com'},{subject:'a'.repeat(201)},{body:''},{body:'a'.repeat(4001)}]){
    assert.ok(validateContactDraft({...draft,...patch}));
    assert.throws(()=>contactMailto({...draft,...patch}));
  }
});
test('contact renderer only accepts the confirmed recipient and plain fields',()=>{
  const tree={$type:'DraftEmail',title:'Contact Lexcia',to:CONTACT_EMAIL,subject:'Contacting Lexcia',body:'',language:'en'};
  assert.ok(validateUI(tree));
  assert.throws(()=>validateUI({...tree,to:'attacker@example.com'}));
  assert.throws(()=>validateUI({...tree,onSend:'fetch("/send")'}));
});
test('contact draft turns do not show proactive follow-up actions',()=>{
  assert.deepEqual(followupSuggestions([{status:'complete',ui:{$type:'DraftEmail'},suggestions:[{prompt:'Schedule a demo',action:'schedule_demo'}]}]),[]);
});
