import MarkdownIt from 'markdown-it';
const markdown=new MarkdownIt({html:false,linkify:false,breaks:true});
export function isHebrewDominant(text){const letters=String(text).match(/\p{L}/gu)||[];return letters.length>0&&letters.filter(c=>/[\u0590-\u05ff]/u.test(c)).length>letters.length/2;}
export function renderAnswer(text){return markdown.render(String(text).replace(/\[\[SOURCE\b[^\]]*(?:\]\]?|$)/g,''));}
