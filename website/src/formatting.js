import MarkdownIt from 'markdown-it';
const markdown=new MarkdownIt({html:false,linkify:false,breaks:true});
// Keep destination labels identical to the landing page, even for older answers.
const sectionLabels={
  '#home':'Lexcia','#about':'About Lexcia','#offer':'What we offer',
  '#how':'How it works','#for':'Who it’s for','#demo':'Live demo',
  '#contact':'Schedule a demo','#schedule-demo':'Schedule a demo',
};
markdown.core.ruler.after('inline','section-link-labels',state=>{
  for(const block of state.tokens){
    const tokens=block.children;if(!tokens)continue;
    for(let index=0;index<tokens.length;index++){
      const token=tokens[index];if(token.type!=='link_open')continue;
      const href=token.attrGet('href');if(!Object.hasOwn(sectionLabels,href))continue;
      const label=sectionLabels[href];
      const closing=tokens.findIndex((next,i)=>i>index&&next.type==='link_close');
      if(closing<0)continue;
      const text=new state.Token('text','',0);text.content=label;
      tokens.splice(index+1,closing-index-1,text);
      token.attrSet('class','section-link');
    }
  }
});
export function isHebrewDominant(text){const letters=String(text).match(/\p{L}/gu)||[];return letters.length>0&&letters.filter(c=>/[\u0590-\u05ff]/u.test(c)).length>letters.length/2;}
export function stripSourceMarkers(text){return String(text??'').replace(/\[\[SOURCE\b[^\]]*(?:\]\]?|$)/g,'');}
export function renderAnswer(text){return markdown.render(stripSourceMarkers(text));}
