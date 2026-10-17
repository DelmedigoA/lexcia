import test from 'node:test';
import assert from 'node:assert/strict';
import {followupSuggestions} from '../src/followup-suggestions.js';
const turn=(id,question='What is Lexcia?')=>({question,answer:'Answer',status:'complete',items:[{item_id:id}]});
test('follow-ups advance past explored topics and offer scheduling',()=>{
  assert.deepEqual(followupSuggestions([turn('overview')]).map(s=>s.prompt),['Which websites is it for?','Schedule a demo']);
  assert.deepEqual(followupSuggestions([turn('overview'),turn('target-market','Which websites is it for?')]).map(s=>s.prompt),['What can Lexcia customize?','Schedule a demo']);
});
test('empty, running, failed and scheduling turns do not show follow-ups',()=>{
  for(const turns of [[],[{status:'running'}],[{status:'error'}],[{status:'complete',scheduling:{step:'form'}}]])assert.deepEqual(followupSuggestions(turns),[]);
});
test('an open demo draft or a declined demo leaves only a learning option',()=>{
  const draft={status:'complete',scheduling:{step:'review'},question:'Schedule a demo'};
  const replies=[draft,turn('overview')];
  assert.equal(followupSuggestions(replies).length,1);
  assert.ok(!followupSuggestions([turn('overview'),turn('target-market',"I don’t want to schedule a demo")]).some(s=>s.prompt==='Schedule a demo'));
});
test('Hebrew questions receive Hebrew follow-up prompts',()=>{
  assert.deepEqual(followupSuggestions([turn('overview','מה זה לקסיה ואיך זה עוזר לאתר שלי?')]).map(s=>s.prompt),['לאילו אתרים Lexcia מתאימה?','לתאם דמו']);
});
