import test from 'node:test';
import assert from 'node:assert/strict';
import {positionNearLauncher} from '../src/panel-position.js';

const button=(left,top)=>({left,top,right:left+50,bottom:top+50});
const desktop={width:1200,height:900},size={width:420,height:620};
const overlap=(a,b,size)=>Math.max(0,Math.min(a.left+size.width,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.top+size.height,b.bottom)-Math.max(a.top,b.top));
function assertInView(result,size,viewport){
  assert.ok(result.left>=10&&result.top>=10);
  assert.ok(result.left+size.width<=viewport.width-10);
  assert.ok(result.top+size.height<=viewport.height-10);
  assert.ok(result.originX>=0&&result.originX<=size.width);
  assert.ok(result.originY>=0&&result.originY<=size.height);
}

test('corners, edges and center stay visible without covering the desktop launcher',()=>{
  for(const [x,y] of [[10,10],[1140,10],[10,840],[1140,840],[575,10],[575,840],[10,425],[1140,425],[575,425]]){
    const launcher=button(x,y),result=positionNearLauncher(launcher,size,desktop);
    assertInView(result,size,desktop);
    assert.equal(overlap(result,launcher,size),0);
  }
});
test('prefers above, flips below, then uses the right or left side',()=>{
  assert.equal(positionNearLauncher(button(575,840),size,desktop).top,210);
  assert.equal(positionNearLauncher(button(575,10),size,desktop).top,70);
  assert.equal(positionNearLauncher(button(10,425),size,desktop).left,70);
  assert.equal(positionNearLauncher(button(1140,425),size,desktop).left,710);
});
test('mobile panel keeps its wide size and chooses above or below when possible',()=>{
  const viewport={width:390,height:844},mobileSize={width:370,height:640};
  for(const y of [10,400,784]){
    const result=positionNearLauncher(button(170,y),mobileSize,viewport);
    assertInView(result,mobileSize,viewport);
    assert.equal(result.left,10);
    if(y!==400)assert.equal(overlap(result,button(170,y),mobileSize),0);
  }
});
test('crowded viewport minimizes overlap and uses distance to break ties',()=>{
  const viewport={width:390,height:400},large={width:370,height:314},launcher=button(170,170);
  const result=positionNearLauncher(launcher,large,viewport);
  assertInView(result,large,viewport);
  assert.equal(overlap(result,launcher,large),2500);
  assert.equal(result.top,10);
});
test('clamped placement avoids the launcher when no un-clamped side fits',()=>{
  const viewport={width:500,height:500},large={width:370,height:400},launcher=button(10,250);
  const result=positionNearLauncher(launcher,large,viewport);
  assertInView(result,large,viewport);
  assert.equal(result.left,70);
  assert.equal(overlap(result,launcher,large),0);
});
test('new launcher bounds and expanded dimensions produce fresh placement',()=>{
  const first=positionNearLauncher(button(10,840),size,desktop);
  const moved=positionNearLauncher(button(1140,10),size,desktop);
  assert.notEqual(first.left,moved.left);
  assert.notEqual(first.top,moved.top);
  const expanded={width:720,height:790};
  assertInView(positionNearLauncher(button(1140,840),expanded,desktop),expanded,desktop);
});
