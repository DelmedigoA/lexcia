import {stripSourceMarkers} from './formatting.js';

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
  for(const [type,label] of [['positive','Helpful answer'],['negative','Unhelpful answer']]){
    const button=actionButton(label,type);button.setAttribute('aria-pressed',String(turn.feedback===type));
    button.onclick=()=>{
      turn.feedback=turn.feedback===type?null:type;
      for(const [value,control] of feedbackButtons)control.setAttribute('aria-pressed',String(turn.feedback===value));
      const saved=onFeedback();
      announce(saved===false?'Feedback updated for this session. Browser storage is unavailable.':turn.feedback?`Marked as ${turn.feedback==='positive'?'helpful':'unhelpful'}. Feedback saved on this device.`:'Feedback removed.');
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

export function showPendingMessage(node,label='Reading Lexcia information…'){
  const pending=document.createElement('div');pending.className='message-pending';
  const dots=document.createElement('span');dots.className='message-pending-dots';dots.setAttribute('aria-hidden','true');
  for(let i=0;i<3;i++)dots.append(document.createElement('i'));
  const text=document.createElement('span');text.className='message-pending-label';text.textContent=label;
  pending.append(dots,text);node.replaceChildren(pending);
}
