import MarkdownIt from 'markdown-it';
const markdown=new MarkdownIt({html:false,linkify:false,breaks:true});
// Favicon source-chip anatomy adapted from assistant-ui's Sources element:
// packages/ui/src/components/react/assistant-ui/elements/sources.aui.tsx
// Copyright (c) 2026 AgentbaseAI Inc. MIT; see public/licenses/assistant-ui.txt.
const sectionLinks=new Set(['#home','#about','#offer','#how','#for','#demo','#contact','#schedule-demo']);
markdown.renderer.rules.link_open=(tokens,index,options,env,renderer)=>{
  const token=tokens[index];
  if(!sectionLinks.has(token.attrGet('href')))return renderer.renderToken(tokens,index,options);
  token.attrSet('data-slot','source');
  return renderer.renderToken(tokens,index,options)
    +'<img data-slot="source-icon" src="/brand/lexcia-monogram.svg" alt="" width="12" height="12">'
    +'<span data-slot="source-icon-fallback" aria-hidden="true">L</span><span data-slot="source-title">';
};
markdown.renderer.rules.link_close=(tokens,index,options,env,renderer)=>{
  let opening=index-1;
  while(opening>=0&&tokens[opening].type!=='link_open')opening--;
  const chip=opening>=0&&sectionLinks.has(tokens[opening].attrGet('href'));
  return (chip?'</span>':'')+renderer.renderToken(tokens,index,options);
};
export function isHebrewDominant(text){const letters=String(text).match(/\p{L}/gu)||[];return letters.length>0&&letters.filter(c=>/[\u0590-\u05ff]/u.test(c)).length>letters.length/2;}
export function stripSourceMarkers(text){return String(text??'').replace(/\[\[SOURCE\b[^\]]*(?:\]\]?|$)/g,'');}
export function renderAnswer(text){return markdown.render(stripSourceMarkers(text));}
