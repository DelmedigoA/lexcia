import test from 'node:test';
import assert from 'node:assert/strict';
import {clampSidebarWidth,defaultSidebarRatio} from '../src/sidebar-layout.js';
test('default pinned sidebar takes 25% across desktop widths',()=>{
  for(const viewport of [701,958,1280,1440,1920,3840])assert.equal(clampSidebarWidth(viewport*defaultSidebarRatio,viewport),viewport*.25);
});
test('manual sidebar resizing preserves space for the page',()=>{
  assert.equal(clampSidebarWidth(100,1440),280);
  assert.equal(clampSidebarWidth(2000,1440),1040);
  assert.equal(clampSidebarWidth(Infinity,701),301);
});
