import {mountAnswer,clearAnswerRoots} from './answer-ui.jsx';
import {renderAnswer,isHebrewDominant} from './formatting.js';
import {askLexcia} from './chat-client.js';
import {makeLauncherDraggable} from './draggable-launcher.js';
import {positionNearLauncher} from './panel-position.js';
import {addMessageActions,showPendingMessage,appendMessageTime,appendDaySeparator,appendStoppedNotice} from './message-ui.js';
import {continuationQuestion,appendContinuation} from './conversation-state.js';
const $=id=>document.getElementById(id);
const panel=$('research-panel'),launcher=$('launcher'),pin=$('pin'),divider=$('assistant-divider');
makeLauncherDraggable(launcher);
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
for(const thread of conversations)for(const turn of thread.turns)if(turn.status==='running')turn.status='stopped';
let currentThreadId=conversations[0]?.id||crypto.randomUUID();
if(!conversations.length)conversations=[{id:currentThreadId,title:'New inquiry',updatedAt:Date.now(),turns:[]}];
let selectedThreadId=currentThreadId;
let renderedThreadId=null;
let closingTimer;
function positionFloatingPanel(){
  if(!panel.open||pinned)return;
  const position=positionNearLauncher(launcher.getBoundingClientRect(),{width:panel.offsetWidth,height:panel.offsetHeight},{width:window.innerWidth,height:window.innerHeight});
  panel.style.setProperty('--panel-left',`${position.left}px`);
  panel.style.setProperty('--panel-top',`${position.top}px`);
  panel.style.setProperty('--panel-origin',`${position.originX}px ${position.originY}px`);
}
let positionFrame;
function schedulePanelPosition(){cancelAnimationFrame(positionFrame);positionFrame=requestAnimationFrame(positionFloatingPanel);}
const panelPositionObserver=new ResizeObserver(schedulePanelPosition);
panelPositionObserver.observe(panel);panelPositionObserver.observe(launcher);
addEventListener('resize',schedulePanelPosition);
function currentConversation(){return conversations.find(thread=>thread.id===currentThreadId);}
function storeConversations(){conversations=conversations.slice(0,20);try{localStorage.setItem(THREADS_KEY,JSON.stringify(conversations));return true;}catch{return false;}}
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
  pinned=value && !matchMedia('(max-width: 700px)').matches;
  panel.classList.toggle('pinned',pinned);
  document.body.classList.toggle('assistant-pinned',pinned);
  divider.hidden=!pinned;
  pin.setAttribute('aria-pressed',String(pinned));
  pin.setAttribute('aria-label',pinned?'Unpin assistant':'Pin assistant beside the page');
  pin.title=pinned?'Unpin assistant':'Pin beside the page';
  if(pinned)setPinnedWidth(pinnedWidth());
  positionFloatingPanel();
}
function renderConversation(thread){
  if(thread&&thread.id===renderedThreadId)return;
  clearAnswerRoots();$('messages').replaceChildren();items.clear();
  let previousTime;
  for(const turn of thread?.turns||[]){
    appendDaySeparator($('messages'),turn.createdAt,previousTime);previousTime=turn.createdAt;
    message('user',turn.question||'',turn.createdAt);const answer=message('assistant');
    answer.dir=isHebrewDominant(turn.answer||'')?'rtl':'ltr';answer.innerHTML=renderAnswer(turn.answer||'',turn.items||[]);
    for(const item of turn.items||[])if(item.item_id)items.set(item.item_id,item);
    finishTurnView(answer,thread,turn);
  }
  renderedThreadId=thread?.id||null;
  $('welcome').hidden=Boolean(thread?.turns?.length);if(thread?.turns?.length)bottom();else $('thread').scrollTop=0;
}
function setConversationView(thread){
  selectedThreadId=thread.id;readOnly=thread.id!==currentThreadId;renderConversation(thread);
  $('thread-list').hidden=true;$('thread').hidden=false;$('composer').parentElement.hidden=readOnly;$('history-note').hidden=!readOnly;
  $('panel-title').textContent=thread.id===currentThreadId&&thread.title==='New inquiry'?'Lexcia':thread.title||'Lexcia';$('threads-toggle').setAttribute('aria-pressed','false');
  $('threads-toggle').setAttribute('aria-label','Show earlier conversations');$('status').textContent=readOnly?'Saved conversation · read only':'';
  updateLatestButton();
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
  updateLatestButton();
}
function openPanel(){if(closing){clearTimeout(closingTimer);closing=false;}const thread=conversations.find(item=>item.id===selectedThreadId)||currentConversation();if(thread)setConversationView(thread);if(!panel.open)panel.showModal();positionFloatingPanel();panel.classList.remove('is-exiting');panel.classList.add('is-entering');launcher.setAttribute('aria-expanded','true');requestAnimationFrame(()=>{if(readOnly)$('panel-title').focus();else{resizeComposer();$('prompt').focus();}});setTimeout(()=>panel.classList.remove('is-entering'),matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);}
function closePanel(){if(!panel.open||closing)return;closing=true;setPinned(false);panel.classList.remove('is-entering');panel.classList.add('is-exiting');launcher.setAttribute('aria-expanded','false');closingTimer=setTimeout(()=>{panel.close();panel.classList.remove('is-exiting');closing=false;launcher.focus();},matchMedia('(prefers-reduced-motion: reduce)').matches?0:200);}
launcher.onclick=()=>panel.open?closePanel():openPanel();$('close').onclick=closePanel;
document.querySelectorAll('[data-open-assistant]').forEach(button=>button.addEventListener('click',openPanel));
panel.addEventListener('cancel',event=>{event.preventDefault();closePanel();});
panel.addEventListener('click',event=>{if(event.target===panel)closePanel();});
$('threads-toggle').onclick=toggleThreadList;
$('expand').onclick=()=>{const expanded=panel.classList.toggle('expanded');$('expand').setAttribute('aria-pressed',String(expanded));$('expand').setAttribute('aria-label',expanded?'Restore panel size':'Expand panel');$('expand').title=expanded?'Restore panel size':'Expand panel';positionFloatingPanel();};
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
addEventListener('resize',()=>{if(pinned){if(matchMedia('(max-width: 700px)').matches)setPinned(false);else setPinnedWidth(pinnedWidth());}});
const grip=$('resize-grip');
function resetFloatSize(){setFloatSize(420,620);panel.classList.remove('expanded');$('expand').setAttribute('aria-pressed','false');$('expand').setAttribute('aria-label','Expand panel');$('expand').title='Expand panel';positionFloatingPanel();}
grip.addEventListener('pointerdown',event=>{
  if(pinned)return;event.preventDefault();grip.setPointerCapture(event.pointerId);
  const start={x:event.clientX,y:event.clientY,width:panel.offsetWidth,height:panel.offsetHeight};
  const resize=move=>{panel.classList.remove('expanded');$('expand').setAttribute('aria-pressed','false');$('expand').setAttribute('aria-label','Expand panel');$('expand').title='Expand panel';setFloatSize(start.width+move.clientX-start.x,start.height-(move.clientY-start.y));positionFloatingPanel();};
  const finish=()=>{grip.removeEventListener('pointermove',resize);grip.removeEventListener('pointerup',finish);grip.removeEventListener('pointercancel',finish);};
  grip.addEventListener('pointermove',resize);grip.addEventListener('pointerup',finish);grip.addEventListener('pointercancel',finish);
});
grip.addEventListener('dblclick',resetFloatSize);
grip.addEventListener('keydown',event=>{if(pinned)return;const size=floatSize();if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();if(event.key==='Home')resetFloatSize();else if(event.key==='End')setFloatSize(window.innerWidth-24,window.innerHeight-108);else setFloatSize(size.width+(event.key==='ArrowRight'?24:event.key==='ArrowLeft'?-24:0),size.height+(event.key==='ArrowUp'?24:event.key==='ArrowDown'?-24:0));positionFloatingPanel();});
function setBusy(value){busy=value;$('send').hidden=value;$('stop').hidden=!value;$('new').disabled=value;$('threads-toggle').disabled=value;$('send').disabled=!$('prompt').value.trim()||value;for(const button of document.querySelectorAll('[data-continue-turn]'))button.disabled=value||!button.canContinue();}
function resizeComposer(){const prompt=$('prompt');prompt.style.height='auto';prompt.style.height=`${Math.min(160,prompt.scrollHeight)}px`;}
let composerWidth=0;
new ResizeObserver(([entry])=>{const width=entry.contentRect.width;if(width>0&&Math.abs(width-composerWidth)>.5){composerWidth=width;resizeComposer();}}).observe($('prompt'));
$('prompt').oninput=()=>{$('send').disabled=busy||!$('prompt').value.trim();resizeComposer();};
$('prompt').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!busy)$('composer').requestSubmit();}});
function message(role,text='',createdAt){const node=document.createElement('article');node.className=`message message--${role}`;node.dir='auto';node.setAttribute('aria-label',role==='user'?'You':'Lexcia');node.textContent=text;if(createdAt)appendMessageTime(node,createdAt);$('messages').append(node);$('welcome').hidden=true;return node;}
function bottom(){const thread=$('thread');thread.scrollTop=thread.scrollHeight;updateLatestButton();}
function nearBottom(){const el=$('thread');return el.scrollHeight-el.scrollTop-el.clientHeight<90;}
function updateLatestButton(){$('latest').hidden=!$('messages').children.length||$('thread').hidden||nearBottom();}
function announceMessageAction(text){$('message-action-status').textContent=text;}
$('latest').onclick=bottom;
$('thread').addEventListener('scroll',updateLatestButton,{passive:true});
new ResizeObserver(updateLatestButton).observe($('messages'));
new ResizeObserver(updateLatestButton).observe($('thread'));
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
function finishTurnView(answer,thread,turn){
  addSources(answer,turn.items||[]);
  if(turn.ui){const surface=document.createElement('div');answer.append(surface);mountAnswer(surface,turn.ui);}
  appendMessageTime(answer,turn.repliedAt);
  addMessageActions(answer,turn,{onFeedback:storeConversations,announce:announceMessageAction});
  if(turn.status==='stopped')appendStoppedNotice(answer,{
    canContinue:()=>!readOnly&&thread.id===currentThreadId&&thread.turns.at(-1)===turn,
    onContinue:()=>{if(!busy&&!readOnly&&thread.turns.at(-1)===turn)runTurn(thread,turn,answer,true);},
    error:turn.error,
  });
  else if(turn.status==='error'){
    const error=document.createElement('p');error.className='message--error';error.setAttribute('role','alert');error.textContent=turn.error||'Lexcia could not complete the answer.';answer.append(error);
  }
  for(const button of answer.querySelectorAll('[data-continue-turn]'))button.disabled=busy||!button.canContinue();
}
async function runTurn(thread,turn,answer,resume=false){
  const requestQuestion=resume?continuationQuestion(turn):turn.question;
  const base=resume?turn.answer||'':'';
  turn.status='running';delete turn.error;storeConversations();
  setBusy(true);$('status').textContent='';controller=new AbortController();answer.setAttribute('aria-busy','true');
  answer.innerHTML=renderAnswer(base);const pending=document.createElement('div');answer.append(pending);showPendingMessage(pending,resume?'Continuing the answer…':'Reading Lexcia information…');
  let text='',readItems=resume?[...(turn.items||[])]:[],finalReceived=false;
  const fullText=()=>appendContinuation(base,text);
  const update=()=>{const follow=nearBottom();answer.dir=isHebrewDominant(fullText())?'rtl':'ltr';answer.innerHTML=renderAnswer(fullText(),readItems);if(follow)bottom();else updateLatestButton();};
  bottom();
  try{
    await askLexcia(requestQuestion,event=>{
      if(event.event==='status'&&!text)showPendingMessage(pending,event.data.message||'Reading Lexcia information…');
      if(event.event==='item'&&event.data.item){const item=event.data.item;items.set(item.item_id,item);if(!readItems.some(i=>i.item_id===item.item_id))readItems.push(item);}
      if(event.event==='delta'){if(!turn.repliedAt)turn.repliedAt=Date.now();text+=event.data.text||'';update();}
      if(event.event==='final'){
        finalReceived=true;const follow=nearBottom();
        text=event.data.answer||text;const finalItems=event.data.items||readItems;readItems=resume?[...new Map([...(turn.items||[]),...finalItems].map(item=>[item.item_id||item.url,item])).values()]:finalItems;for(const item of readItems)items.set(item.item_id,item);update();
        turn.answer=fullText();turn.items=readItems;turn.ui=event.data.ui||null;turn.status='complete';turn.repliedAt??=Date.now();thread.updatedAt=Date.now();storeConversations();finishTurnView(answer,thread,turn);
        if(follow)bottom();else updateLatestButton();
      }
    },controller.signal,currentThreadId);
  }catch(error){
    if(!finalReceived){
      const stopped=error.name==='AbortError';
      turn.answer=fullText();turn.items=readItems;turn.status=stopped||resume?'stopped':'error';turn.repliedAt??=Date.now();
      if(!stopped)turn.error=error.message;
      thread.updatedAt=Date.now();storeConversations();update();finishTurnView(answer,thread,turn);
    }
  }finally{answer.setAttribute('aria-busy','false');setBusy(false);controller=null;$('prompt').focus();updateLatestButton();}
}
$('composer').onsubmit=event=>{
  event.preventDefault();const question=$('prompt').value.trim();if(!question||busy||readOnly)return;
  const thread=currentConversation(),previous=thread.turns.at(-1);
  const turn={question,answer:'',items:[],ui:null,createdAt:Date.now(),status:'running'};thread.turns.push(turn);if(thread.title==='New inquiry')thread.title=question.length>52?`${question.slice(0,49)}…`:question;thread.updatedAt=Date.now();storeConversations();
  appendDaySeparator($('messages'),turn.createdAt,previous?.createdAt);message('user',question,turn.createdAt);$('prompt').value='';resizeComposer();const answer=message('assistant');runTurn(thread,turn,answer);
};
$('stop').onclick=()=>controller?.abort();
async function startNewConversation(){if(busy)return;const thread={id:crypto.randomUUID(),title:'New inquiry',updatedAt:Date.now(),turns:[]};conversations.unshift(thread);currentThreadId=thread.id;selectedThreadId=thread.id;storeConversations();readOnly=false;setConversationView(thread);$('prompt').value='';resizeComposer();$('send').disabled=true;$('status').textContent='';$('prompt').focus();}
$('new').onclick=startNewConversation;
$('continue-new').onclick=startNewConversation;
renderConversation(currentConversation());

// One-page site: sample questions ask the assistant directly; the header tracks scroll and the current section.
document.querySelectorAll('[data-ask]').forEach(button=>button.addEventListener('click',async()=>{openPanel();if(busy)return;if(readOnly)await startNewConversation();$('prompt').value=button.dataset.ask;$('prompt').dispatchEvent(new Event('input'));$('composer').requestSubmit();}));
const siteHeader=document.querySelector('.site-header');
const updateHeader=()=>siteHeader?.classList.toggle('is-scrolled',scrollY>24);
addEventListener('scroll',updateHeader,{passive:true});updateHeader();
const navLinks=[...document.querySelectorAll('.site-nav a[href^="#"]')];
if('IntersectionObserver' in window&&navLinks.length){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;for(const link of navLinks){if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}}},{rootMargin:'-45% 0px -50% 0px'});document.querySelectorAll('main>section[id]').forEach(section=>observer.observe(section));}
