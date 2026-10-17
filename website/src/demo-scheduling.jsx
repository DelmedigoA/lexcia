// Adapted from assistant-ui's generative-booking and generative-create-event specs.
// Copyright (c) 2026 AgentbaseAI Inc. MIT; see public/licenses/assistant-ui.txt.
import React, {useId, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createDemoSlots,validateDemoDraft} from './demo-scheduling.js';
const roots=new Set();
export function clearSchedulingRoots(){for(const root of roots)root.unmount();roots.clear();}

function DemoScheduling({turn}){
  const [draft,setDraft]=useState(()=>turn.scheduling);
  const [error,setError]=useState('');
  const [slots]=useState(()=>turn.demoSlots??(turn.demoSlots=createDemoSlots()));
  const id=useId(),heading=useRef(null),restart=useRef(null);
  const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  function update(patch){const next={...draft,...patch};turn.scheduling=next;setDraft(next);setError('');}
  function discard(){update({step:'cancelled',name:'',email:'',website:'',date:'',time:'',attendees:'1 person',notes:''});requestAnimationFrame(()=>restart.current?.focus());}
  function review(event){
    event.preventDefault();const problem=validateDemoDraft(draft);if(problem){setError(problem);return;}
    update({step:'review'});requestAnimationFrame(()=>heading.current?.focus());
  }
  const start=draft.date&&draft.time?new Date(`${draft.date}T${draft.time}`):null;
  const reviewing=draft.step==='review';
  if(draft.step==='cancelled')return <section className="demo-scheduler"><p role="status">Demo draft discarded.</p><button ref={restart} type="button" onClick={()=>{update({step:'form'});requestAnimationFrame(()=>heading.current?.focus());}}>Start again</button></section>;
  return <section className="demo-scheduler" aria-labelledby={`${id}-title`}>
    <div className="demo-scheduler-heading"><h3 id={`${id}-title`} ref={heading} tabIndex={-1}>{reviewing?'Your demo draft':'Schedule a demo'}</h3><span className="demo-preview-badge">Preview</span></div>
    {reviewing?<>
      <div className="demo-event-date"><strong>{start.getDate()}</strong><div><b>{new Intl.DateTimeFormat('en',{month:'long'}).format(start)}</b><span>{new Intl.DateTimeFormat('en',{weekday:'long',year:'numeric'}).format(start)}</span></div></div>
      <div className="demo-event-summary"><span className="demo-event-accent" aria-hidden="true"/><div><b>Lexcia demo</b><span>{draft.time} · {timezone}</span></div><span className="demo-event-tag">Preferred time</span></div>
      <table className="demo-detail-table"><caption className="sr-only">Demo draft details</caption><tbody>
        <tr><th scope="row">Name</th><td>{draft.name}</td></tr><tr><th scope="row">Email</th><td>{draft.email}</td></tr>
        {draft.website?<tr><th scope="row">Website</th><td>{draft.website}</td></tr>:null}
        <tr><th scope="row">Attendees</th><td>{draft.attendees}</td></tr>
        {draft.notes?<tr><th scope="row">Notes</th><td>{draft.notes}</td></tr>:null}
      </tbody></table>
      <div className="demo-scheduler-actions"><button type="button" className="demo-primary" onClick={()=>{update({step:'form'});requestAnimationFrame(()=>heading.current?.focus());}}>Edit details</button><button type="button" onClick={discard}>Discard</button></div>
    </>:<form className="demo-scheduler-form" onSubmit={review}>
      <label htmlFor={`${id}-name`}>Name<input id={`${id}-name`} name="name" autoComplete="name" maxLength={120} required value={draft.name} onChange={e=>update({name:e.target.value})}/></label>
      <label htmlFor={`${id}-email`}>Work email<input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={254} required value={draft.email} onChange={e=>update({email:e.target.value})}/></label>
      <label htmlFor={`${id}-website`}>Website <span>(optional)</span><input id={`${id}-website`} name="website" placeholder="Your organization’s website" maxLength={300} value={draft.website} onChange={e=>update({website:e.target.value})}/></label>
      <fieldset className="demo-slots"><legend>Choose a time</legend>{slots.map(slot=><label key={`${slot.date}T${slot.time}`} className="demo-slot"><input type="radio" name={`${id}-slot`} required checked={draft.date===slot.date&&draft.time===slot.time} onChange={()=>update(slot)}/><span>{new Intl.DateTimeFormat('en',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${slot.date}T${slot.time}`))}<b>{slot.time}</b></span></label>)}</fieldset>
      <p className="demo-timezone">Sample availability · Times in {timezone}.</p>
      <label htmlFor={`${id}-attendees`}>Attendees<select id={`${id}-attendees`} name="attendees" value={draft.attendees} onChange={e=>update({attendees:e.target.value})}>{['1 person','2 people','3 people','4+ people'].map(value=><option key={value}>{value}</option>)}</select></label>
      <label htmlFor={`${id}-notes`}>Anything else you want us to know? <span>(optional)</span><textarea id={`${id}-notes`} name="notes" rows={2} maxLength={1000} value={draft.notes} onChange={e=>update({notes:e.target.value})}/></label>
      {error?<p role="alert" className="demo-scheduler-error">{error}</p>:null}
      <div className="demo-scheduler-actions"><button className="demo-primary" type="submit">Review demo</button><button type="button" onClick={discard}>Cancel</button></div>
    </form>}
  </section>;
}
export function mountDemoScheduling(container,turn){
  turn.scheduling??={step:'form',name:'',email:'',website:'',date:'',time:'',attendees:'1 person',notes:''};
  const root=createRoot(container);roots.add(root);root.render(<DemoScheduling turn={turn}/>);
}
