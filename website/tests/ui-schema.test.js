import test from 'node:test';
import assert from 'node:assert/strict';
import {validateUI} from '../src/ui-schema.js';
import {demos} from './fixtures/ui-data.js';
for(const [name,tree] of Object.entries(demos)) test(`accepts ${name} composition`,()=>assert.ok(validateUI(tree)));
test('rejects unknown components and prototype names',()=>{for(const $type of ['script','iframe','__proto__','constructor'])assert.throws(()=>validateUI({$type}));});
test('rejects unsafe source URLs',()=>{for(const url of ['javascript:alert(1)','data:text/html,test','http://example.com'])assert.throws(()=>validateUI({$type:'Source',title:'source',url}));});
test('rejects invalid chart data',()=>assert.throws(()=>validateUI({...demos.chart,data:[{label:'test',value:Infinity}]})));
test('rejects injected actions and markup props',()=>{assert.throws(()=>validateUI({...demos.chart,onClick:'alert(1)'}));assert.throws(()=>validateUI({$type:'Text',text:'ok',dangerouslySetInnerHTML:{__html:'<script>'}}));});
test('bounds composition depth and node count',()=>{let tree={$type:'Text',text:'x'};for(let i=0;i<10;i++)tree={$type:'Card',title:'x',children:[tree]};assert.throws(()=>validateUI(tree));assert.throws(()=>validateUI({$type:'Row',children:Array.from({length:81},()=>({$type:'Text',text:'x'}))}));});
test('accepts empty datasets for empty-state rendering',()=>{assert.ok(validateUI({...demos.chart,data:[]}));assert.ok(validateUI({...demos.table,rows:[]}));});

test('validates diagram steps and rejects arbitrary graphic markup',()=>{
  const diagram={$type:'Diagram',title:'Integration',steps:[{title:'Your website',detail:'Existing content'}],source:'Reviewed proposal'};
  assert.ok(validateUI(diagram));
  assert.throws(()=>validateUI({...diagram,svg:'<svg onload="alert(1)"/>'}));
  assert.throws(()=>validateUI({...diagram,steps:[{title:'test',detail:'test',html:'unsafe'}]}));
});
test('validates flow graph references, unique nodes and bounded coordinates',()=>{
  const graph={$type:'FlowGraph',title:'Setup',source:'Proposed workflow',nodes:[{id:'start',label:'Start',column:0,row:0,state:'pending'},{id:'end',label:'Finish',column:1,row:0,state:'pending'}],edges:[{from:'start',to:'end'}]};
  assert.ok(validateUI(graph));
  assert.throws(()=>validateUI({...graph,edges:[{from:'start',to:'missing'}]}));
  assert.throws(()=>validateUI({...graph,nodes:[graph.nodes[0],graph.nodes[0]]}));
  assert.throws(()=>validateUI({...graph,nodes:[{...graph.nodes[0],column:10000}]}));
});
test('accepts paired API cost series and rejects nonfinite estimates',()=>{
  assert.ok(validateUI({...demos.chart,seriesLabels:['Answered questions','Tool-using questions'],data:[{label:'750',value:1.37,highValue:2.29}]}));
  assert.throws(()=>validateUI({...demos.chart,data:[{label:'750',value:1.37,highValue:Infinity}]}));
});
