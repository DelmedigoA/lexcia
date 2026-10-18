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
  if(!panel.open||pinned||panel.classList.contains('embedded'))return;
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
  const wasEmbedded=next&&panel.classList.contains('embedded');
  if(wasEmbedded)undockPanel();
  if(next===pinned)return;
  const wasOpen=panel.open||wasEmbedded,focused=panel.contains(document.activeElement)?document.activeElement:null;
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
  if(panel.classList.contains('embedded')){
    if(heroBotInView()){$('prompt').focus({preventScroll:true});return;}
    undockPanel();
  }
  if(closing){clearTimeout(closingTimer);closing=false;}
  const thread=currentConversation();if(thread)setConversationView(thread);
  if(!panel.open)showPanelDialog();
  positionFloatingPanel();animatePanelEntrance();launcher.setAttribute('aria-expanded','true');
  requestAnimationFrame(()=>{resizeComposer();$('prompt').focus({preventScroll:true});});
}
function closePanel(afterClose){
  if(!panel.open||closing||panel.classList.contains('embedded'))return;
  closing=true;panel.classList.remove('is-entering');panel.classList.add('is-exiting');launcher.setAttribute('aria-expanded','false');
  closingTimer=setTimeout(()=>{panel.close();setPinned(false);panel.classList.remove('is-exiting');closing=false;dockPanel();launcher.focus({preventScroll:true});if(typeof afterClose==='function')afterClose();},matchMedia('(prefers-reduced-motion: reduce)').matches?0:200);
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
launcher.onclick=()=>panel.open&&!panel.classList.contains('embedded')?closePanel():openPanel();$('close').onclick=closePanel;
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
const anchoredReplies=new WeakSet();
function scrollReply(answer,follow){
  if(anchoredReplies.has(answer)||!follow){updateLatestButton();return;}
  const question=answer.previousElementSibling,viewport=$('thread');
  const style=getComputedStyle(viewport);
  const available=viewport.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
  const height=question?answer.getBoundingClientRect().bottom-question.getBoundingClientRect().top:0;
  if(question&&height>available){
    anchoredReplies.add(answer);
    viewport.scrollTop+=question.getBoundingClientRect().top-viewport.getBoundingClientRect().top-parseFloat(style.paddingTop);
    updateLatestButton();
  }else bottom();
}

function updateLatestButton(){$('latest').hidden=!$('messages').children.length||$('thread').hidden||nearBottom();}
$('latest').onclick=bottom;
$('thread').addEventListener('scroll',updateLatestButton,{passive:true});
new ResizeObserver(updateLatestButton).observe($('messages'));
let followupHeight=0;
new ResizeObserver(([entry])=>{
  const growth=Math.max(0,entry.contentRect.height-followupHeight);followupHeight=entry.contentRect.height;
  const thread=$('thread');
  const answer=$('messages').lastElementChild;
  if(answer)scrollReply(answer,thread.scrollHeight-thread.scrollTop-thread.clientHeight<90+growth);else updateLatestButton();
}).observe($('followup-suggestions'));
new ResizeObserver(updateLatestButton).observe($('thread'));
function finishTurnView(answer,thread,turn){
  if(turn.guardrail){
    answer.replaceChildren();
    mountGuardrailNotice(answer,turn.guardrail,question=>{if(!busy&&thread.id===currentThreadId)submitQuestion(question);},{question:turn.question,hebrew:isHebrewDominant(turn.question)});
    return;
  }
  if(turn.scheduling){const surface=document.createElement('div');answer.append(surface);mountDemoScheduling(surface,turn);}
  if(turn.ui){const follow=nearBottom();const surface=document.createElement('div');answer.append(surface);mountAnswer(surface,turn.ui,{turn,onRendered:()=>{scrollReply(answer,follow);}});}
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
  const update=()=>{stopThinking();const follow=nearBottom();answer.dir=isHebrewDominant(fullText())?'rtl':'ltr';answer.innerHTML=renderAnswer(fullText(),readItems);scrollReply(answer,follow);};
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
        scrollReply(answer,follow);
      }
    },controller.signal,currentThreadId);
  }catch(error){
    if(!finalReceived){
      const stopped=error.name==='AbortError';
      turn.answer=fullText();turn.items=readItems;turn.status=stopped||resume?'stopped':'error';turn.repliedAt??=Date.now();
      if(!stopped)turn.error=error.message;
      thread.updatedAt=Date.now();updateConversations();update();finishTurnView(answer,thread,turn);
    }
  }finally{stopThinking();answer.setAttribute('aria-busy','false');setBusy(false);controller=null;$('prompt').focus({preventScroll:true});updateLatestButton();}
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
const navLinks=[...document.querySelectorAll('.site-nav a[href^="#"], .dots a[href^="#"]')];
if('IntersectionObserver' in window&&navLinks.length){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;for(const link of navLinks){if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}document.body.classList.toggle('on-dark',entry.target.id==='demo');}},{rootMargin:'-45% 0px -50% 0px'});document.querySelectorAll('main>section[id]').forEach(section=>observer.observe(section));}

// How it looks: accessible tabs (click, arrow keys, Home/End).
const tabs=[...document.querySelectorAll('.tabs [role=tab]')];
const selectTab=(tab,focus)=>{for(const t of tabs){const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;$(t.getAttribute('aria-controls')).hidden=!on;}if(focus)tab.focus();};
for(const tab of tabs){tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{const i=tabs.indexOf(tab);const next={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:tabs.length-1}[e.key];if(next===undefined)return;e.preventDefault();selectTab(tabs[(next+tabs.length)%tabs.length],true);});}

// Free demo form: validates input, then opens an email to Lexcia with the details filled in.
const DEMO_EMAIL='lexcia.bots@gmail.com';
const demoForm=$('demo-form');
if(demoForm){const email=$('demo-email'),site=$('demo-site'),status=$('demo-status');
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validSite=v=>{try{const u=new URL(/^https?:\/\//i.test(v)?v:`https://${v}`);return /\./.test(u.hostname);}catch{return false;}};
demoForm.addEventListener('submit',event=>{event.preventDefault();const okEmail=validEmail(email.value.trim()),okSite=validSite(site.value.trim());
email.setAttribute('aria-invalid',String(!okEmail));site.setAttribute('aria-invalid',String(!okSite));status.classList.toggle('is-error',!(okEmail&&okSite));
if(!okEmail){status.textContent='Please enter a valid email address.';email.focus();return;}
if(!okSite){status.textContent='Please enter your website address, for example www.yourwebsite.com.';site.focus();return;}
const body=`Hello Lexcia,\n\nI'd like a free demo of Lexcia on my website.\n\nEmail: ${email.value.trim()}\nWebsite: ${site.value.trim()}\n`;
location.href=`mailto:${DEMO_EMAIL}?subject=${encodeURIComponent('Free demo request')}&body=${encodeURIComponent(body)}`;
status.textContent=`Your email app should open with the request ready to send. If it doesn't, write to ${DEMO_EMAIL}.`;});}

// Why Lexcia: an example visitor journey without and with Lexcia, played when the section comes into view.
const JOURNEYS=[
  {path:['Home','About us','Programs','Archive','Events 2023','Gave up'],q:'Which course is right for a beginner?',dest:'Courses › Foundations'},
  {path:['Home','Products','Compare','Pricing (PDF)','Contact sales','Gave up'],q:'Which plan fits a small team?',dest:'Pricing › Team plan'}
];
const journey=$('journey');
if(journey){const path=$('journey-path'),clicks=$('journey-clicks'),jq=$('journey-q'),dest=$('journey-dest'),cap=$('journey-caption'),switches=[...document.querySelectorAll('[data-journey]')];
const replay=()=>{journey.classList.remove('is-playing');void journey.offsetWidth;journey.classList.add('is-playing');};
const show=(i,play)=>{const j=JOURNEYS[i];path.replaceChildren(...j.path.map((step,n)=>{const li=document.createElement('li');li.textContent=step;li.style.setProperty('--i',n);if(n===j.path.length-1)li.className='is-lost';return li;}));
journey.style.setProperty('--n',j.path.length);clicks.textContent=j.path.length-1;jq.textContent=`“${j.q}”`;dest.textContent=j.dest;
cap.textContent=`Example. Without Lexcia, a visitor clicks through ${j.path.slice(0,-1).join(', ')} and gives up. With Lexcia, they ask “${j.q}” and go straight to ${j.dest}.`;
for(const b of switches)b.setAttribute('aria-pressed',String(Number(b.dataset.journey)===i));if(play)replay();};
for(const b of switches)b.addEventListener('click',()=>show(Number(b.dataset.journey),true));
show(0,false);journey.classList.add('is-ready');
if('IntersectionObserver' in window){new IntersectionObserver((entries,obs)=>{if(entries.some(e=>e.isIntersecting)){replay();obs.disconnect();}},{threshold:.45}).observe(journey);}else journey.classList.add('is-playing');}

// Why Lexcia, option A: a question appears and the matching page lights up among many example pages.
const SURFACE=[
  {q:'Which course is right for a beginner?',page:7},
  {q:'Which plan fits a small team?',page:13},
  {q:'Where is last year’s annual report?',page:20},
  {q:'Can I return an order?',page:15}
];
const surface=$('surface');
if(surface){const sq=$('surface-q'),items=[...surface.querySelectorAll('[data-page]')];const still=matchMedia('(prefers-reduced-motion: reduce)').matches;let k=0,timer=null;
const showMatch=i=>{const m=SURFACE[i];sq.classList.add('is-swapping');setTimeout(()=>{sq.textContent=`“${m.q}”`;sq.classList.remove('is-swapping');for(const li of items)li.classList.toggle('is-match',Number(li.dataset.page)===m.page);surface.classList.add('is-found');},still?0:350);};
const start=()=>{if(timer||still)return;showMatch(k);timer=setInterval(()=>{k=(k+1)%SURFACE.length;showMatch(k);},3200);};
const stop=()=>{clearInterval(timer);timer=null;};
showMatch(0);
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))start();else stop();},{threshold:.3}).observe(surface);else start();}

// Option B: on wider screens the real assistant sits inside the hero box. It undocks into the usual
// floating window when opened from elsewhere on the page, and returns to the hero when closed.
const live=$('live'),heroBot=$('hero-bot');
function canDock(){return Boolean(heroBot)&&live?.classList.contains('live--bot')&&matchMedia('(min-width: 701px)').matches;}
function heroBotInView(){if(!heroBot)return false;const r=heroBot.getBoundingClientRect();return r.bottom>innerHeight*.25&&r.top<innerHeight*.75;}
function dockPanel(){
  if(!canDock()||panel.open||closing)return;
  setPinned(false);
  clearTimeout(entranceTimer);
  panel.classList.remove('is-entering','is-exiting');panel.classList.add('embedded');
  heroBot.append(panel);live.classList.add('is-docked');
  const focused=document.activeElement,y=scrollY;
  panel.show();panel.setAttribute('aria-modal','false');
  if(focused instanceof HTMLElement)focused.focus({preventScroll:true});
  if(panel.contains(document.activeElement))document.activeElement.blur();
  scrollTo({top:y,behavior:'instant'});launcher.setAttribute('aria-expanded','false');syncLauncherVisibility();
}
function undockPanel(){
  if(!panel.classList.contains('embedded'))return;
  panel.close();panel.classList.remove('embedded');document.body.append(panel);live?.classList.remove('is-docked');syncLauncherVisibility();
}
function syncLauncherVisibility(){launcher.hidden=pinned||(panel.classList.contains('embedded')&&heroBotInView());}
addEventListener('scroll',syncLauncherVisibility,{passive:true});
dockPanel();
// The hero already exposes the assistant on desktop; mobile keeps the floating welcome.
if(!panel.open)autoOpenTimer=setTimeout(openPanel,500);
addEventListener('resize',()=>{
  if(panel.classList.contains('embedded')&&!canDock()){undockPanel();openPanel();}
  else if(!panel.open)dockPanel();
});
