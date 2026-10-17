// Adapted from assistant-ui's website AssistantWelcome and AssistantThread:
// https://github.com/assistant-ui/assistant-ui/blob/main/apps/docs/components/pages/docs/assistant/thread.tsx
// Copyright (c) 2026 AgentbaseAI Inc. MIT; see public/licenses/assistant-ui.txt.
import React, {Fragment} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal} from 'react-dom';
import {ThreadFollowupSuggestions} from './followup-suggestions.jsx';
import {followupSuggestions} from './followup-suggestions.js';
import {AssistantRuntimeProvider, AuiIf, ThreadPrimitive, useExternalStoreRuntime} from '@assistant-ui/react';

const GREETING_WORDS=['Welcome','to','Lexcia!'];
// Opt into normalization of message-like records (including runtime metadata).
const convertMessage=message=>message;
const SUGGESTIONS=[
  ['What is Lexcia?','What is Lexcia?'],
  ['Which websites is it for?','Which websites is it for?'],
  ['What can Lexcia customize?','What can Lexcia customize?'],
  ['How does pricing work?','How does pricing work?'],
];

function AssistantWelcome(){
  return <div className="thread-welcome">
    <div className="thread-welcome-greeting">
      <h3>{GREETING_WORDS.map((word,index)=><Fragment key={word}>
        <span className="welcome-word" style={{animationDelay:`${index*90}ms`}}>{word}</span>{' '}
      </Fragment>)}<span className="welcome-caret" aria-hidden="true" /></h3>
      <p className="welcome-rise" style={{animationDelay:'500ms'}}>Ask Lexcia about the product, pricing, or this website.</p>
    </div>
    <nav className="welcome-suggestions" aria-label="Suggested questions">
      {SUGGESTIONS.map(([prompt,label],index)=><ThreadPrimitive.Suggestion
        key={prompt} prompt={prompt} send className="welcome-rise"
        style={{animationDelay:`${660+index*60}ms`}}
      ><span className="welcome-arrow" aria-hidden="true">{'>'}</span><span>{label}</span></ThreadPrimitive.Suggestion>)}
    </nav>
  </div>;
}

function WelcomeThread({turns,isRunning,isDisabled,onSend,followupContainer}){
  // Keep the existing transcript/SSE controller as the source of truth while
  // the welcome screen uses assistant-ui's real thread state and send action.
  const messages=turns.flatMap((turn,index)=>[
    {id:`${index}-user`,role:'user',content:[{type:'text',text:turn.question||''}]},
    ...(turn.answer?[{id:`${index}-assistant`,role:'assistant',content:[{type:'text',text:turn.answer}]}]:[]),
  ]);
  const runtime=useExternalStoreRuntime({messages,convertMessage,isRunning,isDisabled,suggestions:followupSuggestions(turns),
    onNew:async message=>onSend(message.content.filter(part=>part.type==='text').map(part=>part.text).join('\n')),
  });
  return <AssistantRuntimeProvider runtime={runtime}>
    <ThreadPrimitive.Root className="welcome-thread" data-slot="assistant-ui-welcome-thread">
      <AuiIf condition={s=>s.thread.isEmpty}><AssistantWelcome /></AuiIf>
      {createPortal(<ThreadFollowupSuggestions key={turns.length}/>,followupContainer)}
    </ThreadPrimitive.Root>
  </AssistantRuntimeProvider>;
}

export function mountWelcome(container,{onSend,followupContainer}){
  const root=createRoot(container);
  return {update:({threadId,...state})=>root.render(<WelcomeThread key={threadId} {...state} onSend={onSend} followupContainer={followupContainer} />)};
}

// Adapted from the website's TraceLine and ShimmerLabel (same MIT notice above):
// apps/docs/components/shared/trace-line.tsx
// packages/ui/src/components/react/assistant-ui/elements/surfaces.tsx
function ThinkingLine({label}){
  return <div className="message-pending" role="status">
    <span className="thinking-marker" aria-hidden="true">{'>'}</span>
    <span className="thinking-shimmer">{label}</span>
  </div>;
}
export function mountThinking(container,label='thinking…'){
  let root=createRoot(container);root.render(<ThinkingLine label={label} />);
  return ()=>{if(root){root.unmount();root=null;}};
}
