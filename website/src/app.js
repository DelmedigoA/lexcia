import {mountAnswer,clearAnswerRoots} from './answer-ui.jsx';
import {renderAnswer,isHebrewDominant} from './formatting.js';
import {askLexcia,resetLexcia} from './chat-client.js';
const $=id=>document.getElementById(id);
const panel=$('research-panel'),launcher=$('launcher'),pin=$('pin'),divider=$('assistant-divider');
const items=new Map();
let busy=false,controller=null;
const PIN_WIDTH_KEY='lexcia:assistant-width';
const FLOAT_SIZE_KEY='lexcia:assistant-size';
const THREADS_KEY='lexcia:assistant-threads';
// Carry existing browser transcripts and panel preferences into the new brand.
for(const key of [PIN_WIDTH_KEY,FLOAT_SIZE_KEY,THREADS_KEY]){
  try{if(localStorage.getItem(key)===null){const previous=localStorage.getItem(key.replace('lexcia:','rabota:'));if(previous!==null)localStorage.setItem(key,previous);}}catch{}
}
let pinned=false;
let closing=false;
let readOnly=false;
function loadConversations(){try{const value=JSON.parse(localStorage.getItem(THREADS_KEY)||'[]');return Array.isArray(value)?value.filter(thread=>thread&&typeof thread.id==='string'&&Array.isArray(thread.turns)).slice(0,20):[];}catch{return [];}}
let conversations=loadConversations();
let currentThreadId=conversations[0]?.id||crypto.randomUUID();
if(!conversations.length)conversations=[{id:currentThreadId,title:'New inquiry',updatedAt:Date.now(),turns:[]}];
let selectedThreadId=currentThreadId;
let renderedThreadId=null;
let closingTimer;
function currentConversation(){return conversations.find(thread=>thread.id===currentThreadId);}
function storeConversations(){conversations=conversations.slice(0,20);try{localStorage.setItem(THREADS_KEY,JSON.stringify(conversations));}catch{}}
function floatSize(){try{const value=JSON.parse(localStorage.getItem(FLOAT_SIZE_KEY)||'{}');return{width:Number(value.width)||420,height:Number(value.height)||620};}catch{return{width:420,height:620};}}
function setFloatSize(width,height){const size={width:Math.round(Math.max(340,Math.min(window.innerWidth-24,width))),height:Math.round(Math.max(360,Math.min(window.innerHeight-108,height)))};document.documentElement.style.setProperty('--floating-width',`${size.width}px`);document.documentElement.style.setProperty('--floating-height',`${size.height}px`);try{localStorage.setItem(FLOAT_SIZE_KEY,JSON.stringify(size));}catch{}}
setFloatSize(floatSize().width,floatSize().height);
function clampPinnedWidth(width){return Math.round(Math.max(360,Math.min(720,window.innerWidth-280,width)));}
function pinnedWidth(){return clampPinnedWidth(Number(localStorage.getItem(PIN_WIDTH_KEY))||420);}
function setPinnedWidth(width){
  const next=clampPinnedWidth(width);
  document.documentElement.style.setProperty('--assistant-width',`${next}px`);
  document.documentElement.style.setProperty('--assistant-divider-left',`${next-4}px`);
  divider.setAttribute('aria-valuenow',String(next));
  localStorage.setItem(PIN_WIDTH_KEY,String(next));
}
function setPinned(value){
  pinned=value && !matchMedia('(max-width: 600px)').matches;
  panel.classList.toggle('pinned',pinned);
  document.body.classList.toggle('assistant-pinned',pinned);
  divider.hidden=!pinned;
  pin.setAttribute('aria-pressed',String(pinned));
  pin.setAttribute('aria-label',pinned?'Unpin assistant':'Pin assistant beside the page');
  pin.title=pinned?'Unpin assistant':'Pin beside the page';
  if(pinned)setPinnedWidth(pinnedWidth());
}
function renderConversation(thread){
  if(thread&&thread.id===renderedThreadId)return;
  clearAnswerRoots();$('messages').replaceChildren();items.clear();
  for(const turn of thread?.turns||[]){
    message('user',turn.question||'');const answer=message('assistant');
    answer.dir=isHebrewDominant(turn.answer||'')?'rtl':'ltr';answer.innerHTML=renderAnswer(turn.answer||'',turn.items||[]);addSources(answer,turn.items||[]);
    for(const item of turn.items||[])if(item.item_id)items.set(item.item_id,item);
    if(turn.ui){const surface=document.createElement('div');answer.append(surface);mountAnswer(surface,turn.ui);}
  }
  renderedThreadId=thread?.id||null;
  $('welcome').hidden=Boolean(thread?.turns?.length);bottom();
}
function setConversationView(thread){
  selectedThreadId=thread.id;readOnly=thread.id!==currentThreadId;renderConversation(thread);
  $('thread-list').hidden=true;$('thread').hidden=false;$('composer').parentElement.hidden=readOnly;$('history-note').hidden=!readOnly;
  $('panel-title').textContent=thread.id===currentThreadId&&thread.title==='New inquiry'?'Lexcia':thread.title||'Lexcia';$('threads-toggle').setAttribute('aria-pressed','false');
  $('threads-toggle').setAttribute('aria-label','Show earlier conversations');$('status').textContent=readOnly?'Saved conversation · read only':'';
}
function renderThreadList(){
  const list=$('thread-list');list.replaceChildren();
  if(!conversations.length){const empty=document.createElement('p');empty.className='thread-list-empty';empty.textContent='No earlier conversations';list.append(empty);return;}
  for(const thread of conversations){const button=document.createElement('button');button.className='thread-list-item';button.type='button';button.setAttribute('aria-current',String(thread.id===selectedThreadId));const title=document.createElement('strong');title.textContent=thread.title||'New inquiry';const meta=document.createElement('span');meta.textContent=new Date(thread.updatedAt||Date.now()).toLocaleDateString(undefined,{month:'short',day:'numeric'});button.append(title,meta);button.onclick=()=>{setConversationView(thread);$('panel-title').focus();if(!readOnly)$('prompt').focus();};list.append(button);}
}
function toggleThreadList(){
  const show=$('thread-list').hidden;readOnly=false;
  if(show){renderThreadList();$('thread-list').hidden=false;$('thread').hidden=true;$('composer').parentElement.hidden=true;$('panel-title').textContent='Conversations';$('threads-toggle').setAttribute('aria-pressed','true');$('threads-toggle').setAttribute('aria-label','Return to inquiry');$('thread-list').querySelector('button')?.focus();}
  else{const thread=conversations.find(item=>item.id===currentThreadId);if(thread)setConversationView(thread);else setConversationView(conversations[0]);$('prompt').focus();}
}
function openPanel(){if(closing){clearTimeout(closingTimer);closing=false;}const thread=conversations.find(item=>item.id===selectedThreadId)||currentConversation();if(thread)setConversationView(thread);if(!panel.open)panel.showModal();panel.classList.remove('is-exiting');panel.classList.add('is-entering');launcher.setAttribute('aria-expanded','true');requestAnimationFrame(()=>readOnly?$('panel-title').focus():$('prompt').focus());setTimeout(()=>panel.classList.remove('is-entering'),matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);}
function closePanel(){if(!panel.open||closing)return;closing=true;setPinned(false);panel.classList.remove('is-entering');panel.classList.add('is-exiting');launcher.setAttribute('aria-expanded','false');closingTimer=setTimeout(()=>{panel.close();panel.classList.remove('is-exiting');closing=false;launcher.focus();},matchMedia('(prefers-reduced-motion: reduce)').matches?0:200);}
launcher.onclick=()=>panel.open?closePanel():openPanel();$('close').onclick=closePanel;
document.querySelectorAll('[data-open-assistant]').forEach(button=>button.addEventListener('click',openPanel));
panel.addEventListener('cancel',event=>{event.preventDefault();closePanel();});
panel.addEventListener('click',event=>{if(event.target===panel)closePanel();});
$('threads-toggle').onclick=toggleThreadList;
$('expand').onclick=()=>{const expanded=panel.classList.toggle('expanded');$('expand').setAttribute('aria-pressed',String(expanded));$('expand').setAttribute('aria-label',expanded?'Restore panel size':'Expand panel');$('expand').title=expanded?'Restore panel size':'Expand panel';};
pin.onclick=()=>setPinned(!pinned);
divider.addEventListener('pointerdown',event=>{
  if(!pinned)return;
  event.preventDefault();divider.setPointerCapture(event.pointerId);
  const resize=move=>setPinnedWidth(move.clientX);
  const finish=()=>{divider.removeEventListener('pointermove',resize);divider.removeEventListener('pointerup',finish);divider.removeEventListener('pointercancel',finish);};
  divider.addEventListener('pointermove',resize);divider.addEventListener('pointerup',finish);divider.addEventListener('pointercancel',finish);
});
divider.addEventListener('keydown',event=>{
  if(!pinned||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const current=pinnedWidth();
  if(event.key==='Home')setPinnedWidth(360);
  else if(event.key==='End')setPinnedWidth(720);
  else setPinnedWidth(current+(event.key==='ArrowRight'?24:-24));
});
addEventListener('resize',()=>{if(pinned)setPinnedWidth(pinnedWidth());});
const grip=$('resize-grip');
function resetFloatSize(){setFloatSize(420,620);panel.classList.remove('expanded');$('expand').setAttribute('aria-pressed','false');$('expand').setAttribute('aria-label','Expand panel');$('expand').title='Expand panel';}
grip.addEventListener('pointerdown',event=>{
  if(pinned)return;event.preventDefault();grip.setPointerCapture(event.pointerId);
  const resize=move=>{panel.classList.remove('expanded');setFloatSize(move.clientX-24,window.innerHeight-move.clientY-88);};
  const finish=()=>{grip.removeEventListener('pointermove',resize);grip.removeEventListener('pointerup',finish);grip.removeEventListener('pointercancel',finish);};
  grip.addEventListener('pointermove',resize);grip.addEventListener('pointerup',finish);grip.addEventListener('pointercancel',finish);
});
grip.addEventListener('dblclick',resetFloatSize);
grip.addEventListener('keydown',event=>{if(pinned)return;const size=floatSize();if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();if(event.key==='Home')resetFloatSize();else if(event.key==='End')setFloatSize(window.innerWidth-24,window.innerHeight-108);else setFloatSize(size.width+(event.key==='ArrowRight'?24:event.key==='ArrowLeft'?-24:0),size.height+(event.key==='ArrowUp'?24:event.key==='ArrowDown'?-24:0));});
function setBusy(value){busy=value;$('send').hidden=value;$('stop').hidden=!value;$('new').disabled=value;$('threads-toggle').disabled=value;$('send').disabled=!$('prompt').value.trim()||value;}
$('prompt').oninput=()=>{$('send').disabled=busy||!$('prompt').value.trim();};
$('prompt').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!busy)$('composer').requestSubmit();}});
function message(role,text=''){const node=document.createElement('article');node.className=`message message--${role}`;node.dir='auto';node.textContent=text;$('messages').append(node);$('welcome').hidden=true;return node;}
function bottom(){const thread=$('thread');thread.scrollTop=thread.scrollHeight;}
function nearBottom(){const el=$('thread');return el.scrollHeight-el.scrollTop-el.clientHeight<90;}
function safeURL(raw){if(!raw||typeof raw!=='string')return null;try{const url=new URL(raw,location.origin);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
function addSources(node,readItems){
  if(!readItems.length)return;
  const sources=document.createElement('section');sources.className='answer-source-list';sources.setAttribute('aria-label','Sources');
  const title=document.createElement('p');title.className='source-list-title';title.textContent='Sources';sources.append(title);
  const seen=new Set();
  for(const item of readItems){
    // Saved conversations may carry website page links from the previous version.
    const legacy=typeof item.url==='string'&&item.url.match(/^\/sources\/([a-z0-9-]+)\/?$/);
    const href=safeURL(legacy?`/api/knowledge/${legacy[1]}`:item.url);if(!href||seen.has(href))continue;seen.add(href);
    const link=document.createElement('a');link.href=href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=item.title||'Open source';sources.append(link);
  }
  if(sources.children.length>1)node.append(sources);
}
$('composer').onsubmit=async event=>{
  event.preventDefault();const question=$('prompt').value.trim();if(!question||busy||readOnly)return;
  const thread=currentConversation();const turn={question,answer:'',items:[],ui:null};thread.turns.push(turn);if(thread.title==='New inquiry')thread.title=question.length>52?`${question.slice(0,49)}…`:question;thread.updatedAt=Date.now();storeConversations();
  message('user',question);$('prompt').value='';const answer=message('assistant');bottom();setBusy(true);$('status').textContent='Connecting…';controller=new AbortController();
  let text='',readItems=[];
  const update=()=>{const follow=nearBottom();answer.dir=isHebrewDominant(text)?'rtl':'ltr';answer.innerHTML=renderAnswer(text,readItems);if(follow)bottom();};
  try{
    await askLexcia(question,event=>{
      if(event.event==='status')$('status').textContent=event.data.message||'Searching…';
      if(event.event==='item'&&event.data.item){const item=event.data.item;items.set(item.item_id,item);if(!readItems.some(i=>i.item_id===item.item_id))readItems.push(item);}
      if(event.event==='delta'){text+=event.data.text||'';update();}
      if(event.event==='final'){
        text=event.data.answer||text;readItems=event.data.items||readItems;for(const item of readItems)items.set(item.item_id,item);update();addSources(answer,readItems);
        turn.answer=text;turn.items=readItems;turn.ui=event.data.ui||null;thread.updatedAt=Date.now();storeConversations();
        if(event.data.ui){const surface=document.createElement('div');answer.append(surface);mountAnswer(surface,event.data.ui);}
      }
    },controller.signal,currentThreadId);
    $('status').textContent='';
  }catch(error){
    const stopped=error.name==='AbortError';
    const notice=stopped?'Stopped.':error.message;
    turn.answer=text;turn.items=readItems;thread.updatedAt=Date.now();storeConversations();
    if(!text){answer.textContent=notice;answer.classList.add('message--error');}else{const p=document.createElement('p');p.className='message--error';p.textContent=notice;answer.append(p);}
    $('status').textContent='';
  }finally{setBusy(false);controller=null;$('prompt').focus();}
};
$('stop').onclick=()=>controller?.abort();
async function startNewConversation(){if(busy)return;$('new').disabled=true;try{await resetLexcia(currentThreadId);const thread={id:crypto.randomUUID(),title:'New inquiry',updatedAt:Date.now(),turns:[]};conversations.unshift(thread);currentThreadId=thread.id;selectedThreadId=thread.id;storeConversations();readOnly=false;setConversationView(thread);$('prompt').value='';$('send').disabled=true;$('status').textContent='';$('prompt').focus();}catch(error){$('status').textContent=error.message;}finally{$('new').disabled=false;}}
$('new').onclick=startNewConversation;
$('continue-new').onclick=startNewConversation;
renderConversation(currentConversation());
