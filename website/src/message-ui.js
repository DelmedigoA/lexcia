import {stripSourceMarkers} from './formatting.js';
import {timestamp,dayKey,dayLabel} from './conversation-state.js';

const icons={
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  positive:'<path d="M7 10v11H3V10h4Zm0 0 5-7a3 3 0 0 1 2 3l-1 4h5a3 3 0 0 1 3 3l-2 6a3 3 0 0 1-3 2H7"/>',
  negative:'<path d="M7 14V3H3v11h4Zm0 0 5 7a3 3 0 0 0 2-3l-1-4h5a3 3 0 0 0 3-3l-2-6a3 3 0 0 0-3-2H7"/>',
};

function setIcon(button,name){
  button.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
}
function actionButton(label,icon){
  const button=document.createElement('button');
  button.type='button';button.className='message-action';button.setAttribute('aria-label',label);button.title=label;
  setIcon(button,icon);return button;
}
function enableCopy(button,text,label,announce){
  let timer;
  button.addEventListener('click',async()=>{
    try{
      if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text());
      setIcon(button,'check');button.setAttribute('aria-label','Copied');button.title='Copied';announce('Copied to clipboard.');
      clearTimeout(timer);timer=setTimeout(()=>{if(button.isConnected){setIcon(button,'copy');button.setAttribute('aria-label',label);button.title=label;}},2000);
    }catch{announce('Could not copy. You can select the text and copy it manually.');}
  });
}

export function addMessageActions(node,turn,{onFeedback,announce}){
  if(!stripSourceMarkers(turn.answer).trim())return;
  const actions=document.createElement('div');actions.className='message-actions';actions.setAttribute('role','group');actions.setAttribute('aria-label','Answer actions');
  const copy=actionButton('Copy answer','copy');enableCopy(copy,()=>stripSourceMarkers(turn.answer).trim(),'Copy answer',announce);actions.append(copy);
  const feedbackButtons=[];
  const updateFeedback=()=>{
    for(const [value,control] of feedbackButtons)control.setAttribute('aria-pressed',String(turn.feedback===value));
    const saved=onFeedback();
    announce(saved===false?'Feedback updated for this session. Browser storage is unavailable.':turn.feedback?`Marked as ${turn.feedback==='positive'?'helpful':'unhelpful'}. Feedback saved on this device.`:'Feedback removed.');
  };
  for(const [type,label] of [['positive','Helpful answer'],['negative','Unhelpful answer']]){
    const button=actionButton(label,type);button.setAttribute('aria-pressed',String(turn.feedback===type));
    button.onclick=()=>{
      if(type==='negative'){openFeedbackDialog(node,button,turn,updateFeedback);return;}
      turn.feedback=turn.feedback===type?null:type;
      delete turn.feedbackReason;delete turn.feedbackComment;updateFeedback();
    };
    feedbackButtons.push([type,button]);actions.append(button);
  }
  node.append(actions);
  for(const pre of node.querySelectorAll('pre')){
    const code=pre.querySelector('code');if(!code||pre.parentElement.classList.contains('message-code'))continue;
    const block=document.createElement('div');block.className='message-code';
    const header=document.createElement('div');header.className='message-code-header';
    const language=document.createElement('span');language.textContent=([...code.classList].find(name=>name.startsWith('language-'))?.slice(9)||'Code').slice(0,40);
    const codeCopy=actionButton('Copy code','copy');enableCopy(codeCopy,()=>code.textContent,'Copy code',announce);
    header.append(language,codeCopy);pre.replaceWith(block);block.append(header,pre);
  }
}

function openFeedbackDialog(node,trigger,turn,onSave){
  const host=node.closest('dialog');if(!host||host.querySelector('.feedback-overlay'))return;
  const id=`feedback-${crypto.randomUUID()}`;
  const overlay=document.createElement('div');overlay.className='feedback-overlay';
  const dialog=document.createElement('section');dialog.className='feedback-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby',id);
  const title=document.createElement('h3');title.id=id;title.textContent='What could be better?';
  const detail=document.createElement('p');detail.textContent='Your feedback is saved with this conversation on this device.';
  const reasons=document.createElement('div');reasons.className='feedback-reasons';reasons.setAttribute('role','group');reasons.setAttribute('aria-label','Feedback reason');
  let selected=turn.feedbackReason||'';
  const noteLabel=document.createElement('label');noteLabel.htmlFor=`${id}-note`;noteLabel.textContent='Add a note (optional)';
  const note=document.createElement('textarea');note.id=noteLabel.htmlFor;note.rows=2;note.maxLength=1000;note.value=turn.feedbackComment||'';
  const footer=document.createElement('div');footer.className='feedback-footer';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';
  const save=document.createElement('button');save.type='button';save.className='feedback-save';save.textContent='Save feedback';
  const update=()=>{for(const button of reasons.children)button.setAttribute('aria-pressed',String(button.textContent===selected));save.disabled=!selected&&!note.value.trim();};
  for(const reason of ['Incorrect information','Not relevant','Too vague','Something else']){
    const button=document.createElement('button');button.type='button';button.className='feedback-reason';button.textContent=reason;button.onclick=()=>{selected=selected===reason?'':reason;update();};reasons.append(button);
  }
  footer.append(cancel,save);dialog.append(title,detail,reasons,noteLabel,note,footer);overlay.append(dialog);host.append(overlay);
  const siblings=[...host.children].filter(child=>child!==overlay).map(child=>[child,child.inert]);
  for(const [child] of siblings)child.inert=true;
  const close=()=>{for(const [child,inert] of siblings)child.inert=inert;overlay.remove();if(trigger.isConnected)trigger.focus();};
  cancel.onclick=close;overlay.onclick=event=>{if(event.target===overlay)close();};
  note.oninput=update;
  save.onclick=()=>{if(save.disabled)return;turn.feedback='negative';turn.feedbackReason=selected;turn.feedbackComment=note.value.trim();close();onSave();};
  if(turn.feedback==='negative'){
    const remove=document.createElement('button');remove.type='button';remove.className='feedback-remove';remove.textContent='Remove feedback';remove.onclick=()=>{turn.feedback=null;delete turn.feedbackReason;delete turn.feedbackComment;close();onSave();};dialog.append(remove);
  }
  overlay.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
    if(event.key==='Tab'){
      const controls=[...dialog.querySelectorAll('button:not(:disabled),textarea')];const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  update();reasons.querySelector('button').focus();
}

export function appendMessageTime(node,value){
  const date=timestamp(value);if(!date)return;
  const time=document.createElement('time');time.className='message-time';time.dateTime=date.toISOString();time.textContent=date.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});time.title=date.toLocaleString();time.setAttribute('aria-label',time.title);node.title=time.title;node.append(time);
}
export function appendDaySeparator(container,value,previous){
  const key=dayKey(value);if(!key||key===dayKey(previous))return;
  const separator=document.createElement('div');separator.className='conversation-day';separator.setAttribute('role','separator');separator.setAttribute('aria-label',dayLabel(value));
  const label=document.createElement('span');label.textContent=dayLabel(value);separator.append(label);container.append(separator);
}
export function appendStoppedNotice(node,{canContinue,onContinue,error}){
  const notice=document.createElement('div');notice.className='stopped-notice';notice.setAttribute('role','status');
  const text=document.createElement('span');text.textContent=error?'Could not continue. Your partial answer is saved.':'Response stopped';notice.append(text);
  if(canContinue()){
    const button=document.createElement('button');button.type='button';button.textContent='Continue';button.dataset.continueTurn='';button.canContinue=canContinue;button.onclick=onContinue;notice.append(button);
  }
  node.append(notice);
}
