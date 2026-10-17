// Adapted from assistant-ui's standalone GuardrailNotice (MIT):
// packages/ui/src/components/react/assistant-ui/elements/guardrail-notice.tsx
// Copyright (c) 2026 AgentbaseAI Inc.; see public/licenses/assistant-ui.txt.
import React from 'react';
import {createRoot} from 'react-dom/client';
const roots=new Set();
export function clearGuardrailRoots(){for(const root of roots)root.unmount();roots.clear();}

export function GuardrailNotice({title,explanation,policy,alternatives,onPick,hebrew=false}){
  return <div data-slot="guardrail-notice" className="guardrail-notice" role="status">
    <div className="guardrail-heading"><span className="guardrail-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z"/></svg></span><b>{title}</b><span className="guardrail-policy">{policy}</span></div>
    <p>{explanation}</p>
    {alternatives.length>0?<div className="guardrail-alternatives"><span>{hebrew?'אפשר לשאול במקום':'Try instead'}</span>{alternatives.map(alternative=><button key={alternative} type="button" onClick={()=>onPick(alternative)}>{alternative}</button>)}</div>:null}
  </div>;
}

export function mountGuardrailNotice(container,notice,onPick,{question,hebrew=false}={}){
  const root=createRoot(container);roots.add(root);
  const unavailable=notice.kind==='unavailable';
  root.render(<GuardrailNotice {...notice} hebrew={hebrew}
    alternatives={unavailable?[hebrew?'לנסות שוב':'Try again']:notice.alternatives}
    onPick={alternative=>onPick(unavailable?question:alternative)}/>);
}
