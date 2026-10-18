import {mountAnswer,clearAnswerRoots} from './answer-ui.jsx';
import {renderAnswer,isHebrewDominant} from './formatting.js';
import {askLexcia} from './chat-client.js';
import {makeLauncherDraggable} from './draggable-launcher.js';
import {positionNearLauncher,heightNearLauncher} from './panel-position.js';
import {appendStoppedNotice} from './message-ui.js';
import {continuationQuestion,appendContinuation} from './conversation-state.js';
import {mountWelcome,mountThinking} from './thread-welcome.jsx';
import {mountDemoScheduling,clearSchedulingRoots} from './demo-scheduling.jsx';
import {mountGuardrailNotice,clearGuardrailRoots} from './guardrail-notice.jsx';
import {isSchedulingRequest} from './followup-suggestions.js';
import {clampSidebarWidth,defaultSidebarRatio} from './sidebar-layout.js';
const $=id=>document.getElementById(id);
const panel=$('research-panel'),launcher=$('launcher'),pin=$('pin'),divider=$('assistant-divider');
makeLauncherDraggable(launcher);
const items=new Map();
let busy=false,controller=null;
// Clear the former persisted assistant state; visits now keep state only in memory.
for(const prefix of ['lexcia:','rabota:'])for(const name of ['assistant-width','assistant-size','assistant-threads']){
  try{localStorage.removeItem(prefix+name);}catch{}
}
let pinned=false,closing=false;
let floatingSize={width:420,height:620},sidebarRatio=defaultSidebarRatio;
let currentThreadId=crypto.randomUUID();
let conversations=[{id:currentThreadId,title:'New inquiry',updatedAt:Date.now(),turns:[]}];
let renderedThreadId=null;
let closingTimer,autoOpenTimer,entranceTimer;
const welcomeThread=mountWelcome($('welcome'),{onSend:question=>submitQuestion(question),onWelcomeSuggestion:()=>{sidebarRatio=Math.max(sidebarRatio,defaultSidebarRatio);setPinned(true);},followupContainer:$('followup-suggestions')});
function syncWelcome(){const thread=currentConversation();welcomeThread.update({threadId:thread.id,turns:thread.turns,isRunning:busy,isDisabled:false});}
function positionFloatingPanel(){
  if(!panel.open||pinned)return;
  const anchor=launcher.getBoundingClientRect(),viewport={width:window.innerWidth,height:window.innerHeight};
  panel.style.setProperty('--floating-height',`${heightNearLauncher(anchor,floatSize().height,viewport)}px`);
  const position=positionNearLauncher(anchor,{width:panel.offsetWidth,height:panel.offsetHeight},viewport);
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
function updateConversations(){conversations=conversations.slice(0,20);}
function floatSize(){return floatingSize;}
function setFloatSize(width,height,{remember=true}={}){const size={width:Math.round(Math.max(340,Math.min(window.innerWidth-24,width))),height:Math.round(Math.max(360,Math.min(window.innerHeight-108,height)))};document.documentElement.style.setProperty('--floating-width',`${size.width}px`);document.documentElement.style.setProperty('--floating-height',`${size.height}px`);if(remember)floatingSize=size;}
setFloatSize(floatSize().width,floatSize().height,{remember:false});
function clampPinnedWidth(width){return clampSidebarWidth(width,document.documentElement.clientWidth);}
function pinnedWidth(){return clampPinnedWidth(document.documentElement.clientWidth*sidebarRatio);}
function setPinnedWidth(width){
  const next=clampPinnedWidth(width);
  document.documentElement.style.setProperty('--assistant-width',`${next}px`);
  document.documentElement.style.setProperty('--assistant-divider-right',`${next-4}px`);
  divider.setAttribute('aria-valuenow',String(next));
  divider.setAttribute('aria-valuemin',String(clampPinnedWidth(0)));
  divider.setAttribute('aria-valuemax',String(clampPinnedWidth(Infinity)));
  sidebarRatio=next/document.documentElement.clientWidth;
}
function showPanelDialog(){
  if(pinned)panel.show();else panel.showModal();
  panel.setAttribute('aria-modal',String(!pinned));
}
function setPinned(value){
  const next=value&&!matchMedia('(max-width: 700px)').matches;
  if(next===pinned)return;
  const wasOpen=panel.open,focused=panel.contains(document.activeElement)?document.activeElement:null;
  pinned=next;launcher.hidden=pinned;
  panel.classList.toggle('pinned',pinned);
  document.body.classList.toggle('assistant-pinned',pinned);
  divider.hidden=!pinned;
  pin.setAttribute('aria-pressed',String(pinned));
  pin.setAttribute('aria-label',pinned?'Unpin assistant':'Pin assistant beside the page');
  pin.title=pinned?'Unpin assistant':'Pin beside the page';
  if(pinned)setPinnedWidth(pinnedWidth());
  // Native modal dialogs keep the page inert even with a transparent backdrop.
  // Reopen in the correct native mode so pinning also restores page interaction.
  if(wasOpen){panel.close();showPanelDialog();focused?.focus({preventScroll:true});}
  positionFloatingPanel();
}
function renderConversation(thread){
  syncWelcome();
  if(thread&&thread.id===renderedThreadId)return;
  clearAnswerRoots();clearSchedulingRoots();clearGuardrailRoots();$('messages').replaceChildren();items.clear();
  for(const turn of thread?.turns||[]){
    message('user',turn.question||'');const answer=message('assistant');
    answer.dir=isHebrewDominant(turn.answer||'')?'rtl':'ltr';answer.innerHTML=renderAnswer(turn.answer||'',turn.items||[]);
    for(const item of turn.items||[])if(item.item_id)items.set(item.item_id,item);
    finishTurnView(answer,thread,turn);
  }
  renderedThreadId=thread?.id||null;
  $('welcome').hidden=Boolean(thread?.turns?.length);if(thread?.turns?.length)bottom();else $('thread').scrollTop=0;
}
function setConversationView(thread){
  renderConversation(thread);
  $('status').textContent='';updateLatestButton();
}
function animatePanelEntrance(){
  clearTimeout(entranceTimer);
  panel.classList.remove('is-exiting','is-entering');
  void panel.offsetWidth; // Restart even when pinning during the previous entrance.
  panel.classList.add('is-entering');
  entranceTimer=setTimeout(()=>panel.classList.remove('is-entering'),matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);
}
function openPanel(){
  clearTimeout(autoOpenTimer);
  if(closing){clearTimeout(closingTimer);closing=false;}
  const thread=currentConversation();if(thread)setConversationView(thread);
  if(!panel.open)showPanelDialog();
  positionFloatingPanel();animatePanelEntrance();launcher.setAttribute('aria-expanded','true');
  requestAnimationFrame(()=>{resizeComposer();$('prompt').focus({preventScroll:true});});
}
function closePanel(afterClose){
  if(!panel.open||closing)return;
  closing=true;panel.classList.remove('is-entering');panel.classList.add('is-exiting');launcher.setAttribute('aria-expanded','false');
  closingTimer=setTimeout(()=>{panel.close();setPinned(false);panel.classList.remove('is-exiting');closing=false;launcher.focus({preventScroll:true});if(typeof afterClose==='function')afterClose();},matchMedia('(prefers-reduced-motion: reduce)').matches?0:200);
}
// Reveal the landing-page box linked from an answer, preserving the conversation.
$('messages').addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  if(link.getAttribute('href')==='#schedule-demo'){event.preventDefault();submitQuestion('Schedule a demo');return;}
  const target=document.getElementById(link.getAttribute('href').slice(1));
  if(!target||!target.matches('main>section[id]'))return;
  event.preventDefault();
  const jump=()=>{
    history.replaceState(null,'',link.getAttribute('href'));
    target.scrollIntoView({block:'start'});
    const heading=target.querySelector('h1,h2,h3')||target;
    heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
  };
  if(matchMedia('(max-width: 700px)').matches){closePanel(jump);return;}
  document.body.classList.add('navigating-section');
  sidebarRatio=defaultSidebarRatio;setPinned(true);setPinnedWidth(pinnedWidth());
  requestAnimationFrame(()=>{jump();requestAnimationFrame(()=>document.body.classList.remove('navigating-section'));});
});
launcher.onclick=()=>panel.open?closePanel():openPanel();$('close').onclick=closePanel;
document.querySelectorAll('[data-open-assistant]').forEach(button=>button.addEventListener('click',openPanel));
document.querySelectorAll('[data-schedule-demo]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();openPanel();submitQuestion('Schedule a demo');}));
panel.addEventListener('cancel',event=>{if(event.target!==panel)return;event.preventDefault();closePanel();});
panel.addEventListener('click',event=>{if(!pinned&&event.target===panel)closePanel();});
panel.addEventListener('keydown',event=>{if(pinned&&event.target.closest('dialog')===panel&&event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();closePanel();}});
pin.onclick=()=>setPinned(!pinned);
divider.addEventListener('pointerdown',event=>{
  if(!pinned)return;
  event.preventDefault();divider.setPointerCapture(event.pointerId);
  const resize=move=>setPinnedWidth(document.documentElement.clientWidth-move.clientX);
  const finish=()=>{divider.removeEventListener('pointermove',resize);divider.removeEventListener('pointerup',finish);divider.removeEventListener('pointercancel',finish);};
  divider.addEventListener('pointermove',resize);divider.addEventListener('pointerup',finish);divider.addEventListener('pointercancel',finish);
});
divider.addEventListener('keydown',event=>{
  if(!pinned||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const current=pinnedWidth();
  if(event.key==='Home')setPinnedWidth(0);
  else if(event.key==='End')setPinnedWidth(Infinity);
  else setPinnedWidth(current+(event.key==='ArrowLeft'?24:-24));
});
addEventListener('resize',()=>{if(pinned){if(matchMedia('(max-width: 700px)').matches)setPinned(false);else setPinnedWidth(pinnedWidth());}});
const grip=$('resize-grip');
function resetFloatSize(){setFloatSize(420,620);positionFloatingPanel();}
grip.addEventListener('pointerdown',event=>{
  if(pinned)return;event.preventDefault();grip.setPointerCapture(event.pointerId);
  const start={x:event.clientX,y:event.clientY,width:panel.offsetWidth,height:panel.offsetHeight};
  const resize=move=>{setFloatSize(start.width+move.clientX-start.x,start.height-(move.clientY-start.y));positionFloatingPanel();};
  const finish=()=>{grip.removeEventListener('pointermove',resize);grip.removeEventListener('pointerup',finish);grip.removeEventListener('pointercancel',finish);};
  grip.addEventListener('pointermove',resize);grip.addEventListener('pointerup',finish);grip.addEventListener('pointercancel',finish);
});
grip.addEventListener('dblclick',resetFloatSize);
grip.addEventListener('keydown',event=>{if(pinned)return;const size=floatSize();if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();if(event.key==='Home')resetFloatSize();else if(event.key==='End')setFloatSize(window.innerWidth-24,window.innerHeight-108);else setFloatSize(size.width+(event.key==='ArrowRight'?24:event.key==='ArrowLeft'?-24:0),size.height+(event.key==='ArrowUp'?24:event.key==='ArrowDown'?-24:0));positionFloatingPanel();});
function setBusy(value){busy=value;syncWelcome();$('new').disabled=value;$('send').disabled=!$('prompt').value.trim()||value;for(const button of document.querySelectorAll('[data-continue-turn]'))button.disabled=value||!button.canContinue();}
function resizeComposer(){const prompt=$('prompt');prompt.style.height='auto';prompt.style.height=`${Math.min(160,prompt.scrollHeight)}px`;}
let composerWidth=0;
new ResizeObserver(([entry])=>{const width=entry.contentRect.width;if(width>0&&Math.abs(width-composerWidth)>.5){composerWidth=width;resizeComposer();}}).observe($('prompt'));
$('prompt').oninput=()=>{$('send').disabled=busy||!$('prompt').value.trim();resizeComposer();};
$('prompt').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!busy)$('composer').requestSubmit();}});
function message(role,text=''){const node=document.createElement('article');node.className=`message message--${role}`;node.dir='auto';node.setAttribute('aria-label',role==='user'?'You':'Lexcia');node.textContent=text;$('messages').append(node);$('welcome').hidden=true;return node;}
function bottom(){const thread=$('thread');thread.scrollTop=thread.scrollHeight;updateLatestButton();}
function nearBottom(){const el=$('thread');return el.scrollHeight-el.scrollTop-el.clientHeight<90;}
function updateLatestButton(){$('latest').hidden=!$('messages').children.length||$('thread').hidden||nearBottom();}
$('latest').onclick=bottom;
$('thread').addEventListener('scroll',updateLatestButton,{passive:true});
new ResizeObserver(updateLatestButton).observe($('messages'));
let followupHeight=0;
new ResizeObserver(([entry])=>{
  const growth=Math.max(0,entry.contentRect.height-followupHeight);followupHeight=entry.contentRect.height;
  const thread=$('thread');
  if(thread.scrollHeight-thread.scrollTop-thread.clientHeight<90+growth)bottom();else updateLatestButton();
}).observe($('followup-suggestions'));
new ResizeObserver(updateLatestButton).observe($('thread'));
function finishTurnView(answer,thread,turn){
  if(turn.guardrail){
    answer.replaceChildren();
    mountGuardrailNotice(answer,turn.guardrail,question=>{if(!busy&&thread.id===currentThreadId)submitQuestion(question);},{question:turn.question,hebrew:isHebrewDominant(turn.question)});
    return;
  }
  if(turn.scheduling){const surface=document.createElement('div');answer.append(surface);mountDemoScheduling(surface,turn);}
  if(turn.ui){const follow=nearBottom();const surface=document.createElement('div');answer.append(surface);mountAnswer(surface,turn.ui,{turn,onRendered:()=>{if(follow)bottom();else updateLatestButton();}});}
  if(turn.status==='stopped')appendStoppedNotice(answer,{
    canContinue:()=>thread.id===currentThreadId&&thread.turns.at(-1)===turn,
    onContinue:()=>{if(!busy&&thread.turns.at(-1)===turn)runTurn(thread,turn,answer,true);},
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
  turn.status='running';turn.suggestions=[];turn.suggestionsStreaming=false;delete turn.error;updateConversations();
  setBusy(true);$('status').textContent='';controller=new AbortController();answer.setAttribute('aria-busy','true');
  answer.innerHTML=renderAnswer(base);const pending=document.createElement('div');answer.append(pending);const stopThinking=mountThinking(pending,resume?'continuing…':'thinking…');
  let text='',readItems=resume?[...(turn.items||[])]:[],finalReceived=false;
  const fullText=()=>appendContinuation(base,text);
  const update=()=>{stopThinking();const follow=nearBottom();answer.dir=isHebrewDominant(fullText())?'rtl':'ltr';answer.innerHTML=renderAnswer(fullText(),readItems);if(follow)bottom();else updateLatestButton();};
  bottom();
  try{
    await askLexcia(requestQuestion,event=>{
      if(event.event==='item'&&event.data.item){const item=event.data.item;items.set(item.item_id,item);if(!readItems.some(i=>i.item_id===item.item_id))readItems.push(item);}
      if(event.event==='delta'){if(!turn.repliedAt)turn.repliedAt=Date.now();text+=event.data.text||'';update();}
      if(event.event==='suggestion'&&event.data.suggestion){turn.suggestionsStreaming=true;turn.suggestions.push(event.data.suggestion);syncWelcome();}
      if(event.event==='final'){
        finalReceived=true;const follow=nearBottom();
        text=event.data.answer||text;const finalItems=event.data.items||readItems;readItems=resume?[...new Map([...(turn.items||[]),...finalItems].map(item=>[item.item_id||item.url,item])).values()]:finalItems;for(const item of readItems)items.set(item.item_id,item);update();
        turn.answer=fullText();turn.items=readItems;turn.suggestions=event.data.suggestions||[];turn.suggestionsStreaming=false;turn.guardrail=event.data.guardrail||null;turn.ui=event.data.ui||null;turn.status='complete';turn.repliedAt??=Date.now();thread.updatedAt=Date.now();updateConversations();finishTurnView(answer,thread,turn);
        if(follow)bottom();else updateLatestButton();
      }
    },controller.signal,currentThreadId);
  }catch(error){
    if(!finalReceived){
      const stopped=error.name==='AbortError';
      turn.answer=fullText();turn.items=readItems;turn.status=stopped||resume?'stopped':'error';turn.repliedAt??=Date.now();
      if(!stopped)turn.error=error.message;
      thread.updatedAt=Date.now();updateConversations();update();finishTurnView(answer,thread,turn);
    }
  }finally{stopThinking();answer.setAttribute('aria-busy','false');setBusy(false);controller=null;$('prompt').focus();updateLatestButton();}
}
function submitQuestion(question){
  question=question.trim();if(!question||busy)return;
  const thread=currentConversation();
  const scheduleDemo=isSchedulingRequest(thread.turns,question);
  const turn={question,answer:'',items:[],ui:null,createdAt:Date.now(),status:'running'};thread.turns.push(turn);if(thread.title==='New inquiry')thread.title=question.length>52?`${question.slice(0,49)}…`:question;thread.updatedAt=Date.now();updateConversations();
  message('user',question);$('prompt').value='';resizeComposer();const answer=message('assistant');
  if(scheduleDemo){
    if(!matchMedia('(max-width: 700px)').matches){sidebarRatio=Math.max(sidebarRatio,defaultSidebarRatio);setPinned(true);setPinnedWidth(pinnedWidth());}
    turn.answer='We’re excited to explore how Lexcia could work on your website!\n\nChoose your preferred details below, then click **Review demo**.';turn.status='complete';turn.scheduling={step:'form',name:'',email:'',website:'',date:'',time:'',attendees:'1 person',notes:''};
    answer.innerHTML=renderAnswer(turn.answer);finishTurnView(answer,thread,turn);syncWelcome();$('send').disabled=true;requestAnimationFrame(()=>{answer.scrollIntoView({block:'start'});answer.querySelector('h3')?.focus({preventScroll:true});});return;
  }
  return runTurn(thread,turn,answer);
}
$('composer').onsubmit=event=>{event.preventDefault();submitQuestion($('prompt').value);};
async function startNewConversation(){if(busy)return;const thread={id:crypto.randomUUID(),title:'New inquiry',updatedAt:Date.now(),turns:[]};conversations.unshift(thread);currentThreadId=thread.id;updateConversations();setConversationView(thread);$('prompt').value='';resizeComposer();$('send').disabled=true;$('status').textContent='';$('prompt').focus();}
$('new').onclick=startNewConversation;
renderConversation(currentConversation());

// One-page site: sample questions ask the assistant directly; the header tracks scroll and the current section.
document.querySelectorAll('[data-ask]').forEach(button=>button.addEventListener('click',()=>{openPanel();if(busy)return;$('prompt').value=button.dataset.ask;$('prompt').dispatchEvent(new Event('input'));$('composer').requestSubmit();}));
const siteHeader=document.querySelector('.site-header');
const updateHeader=()=>siteHeader?.classList.toggle('is-scrolled',scrollY>24);
addEventListener('scroll',updateHeader,{passive:true});updateHeader();
const navLinks=[...document.querySelectorAll('.site-nav a[href^="#"]')];
if('IntersectionObserver' in window&&navLinks.length){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;for(const link of navLinks){if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}}},{rootMargin:'-45% 0px -50% 0px'});document.querySelectorAll('main>section[id]').forEach(section=>observer.observe(section));}

// Once per page load, follow the same floating opening path as a launcher click.
autoOpenTimer=setTimeout(openPanel,500);
