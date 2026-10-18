// Compact contact form; original form styling adapted from assistant-ui (MIT).
// Copyright (c) 2026 AgentbaseAI Inc.; see public/licenses/assistant-ui.txt.
import React, {createContext, useContext, useId, useState} from 'react';
import {validateContactForm} from './contact-form.js';

export const AnswerTurnContext=createContext(null);
export function ContactForm({title,language='en'}){
  const turn=useContext(AnswerTurnContext);
  const [values,setValues]=useState(()=>turn?.contactForm??{email:'',subject:'',content:''});
  const [error,setError]=useState('');
  const id=useId();
  const t=(en,he)=>language==='he'?he:en;
  function update(patch){const next={...values,submitted:false,...patch};if(turn)turn.contactForm=next;setValues(next);setError('');}
  function submit(event){
    event.preventDefault();
    if(validateContactForm(values)){setError(t('Please complete all three fields.','נא למלא את שלושת השדות.'));return;}
    update({submitted:true});
  }
  return <section className="contact-form-card" data-slot="contact-form" dir={language==='he'?'rtl':'ltr'} aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>{title}</h3>
    <form className="contact-form" onSubmit={submit}>
      <label htmlFor={`${id}-email`}>{t('Email','אימייל')}<input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={e=>update({email:e.target.value})}/></label>
      <label htmlFor={`${id}-subject`}>{t('Subject','נושא')}<input id={`${id}-subject`} name="subject" dir="auto" required maxLength={200} value={values.subject} onChange={e=>update({subject:e.target.value})}/></label>
      <label htmlFor={`${id}-content`}>{t('Content','תוכן')}<textarea id={`${id}-content`} name="content" dir="auto" required rows={2} maxLength={4000} value={values.content} onChange={e=>update({content:e.target.value})}/></label>
      {error?<p className="contact-form-error" role="alert">{error}</p>:null}
      <div className="contact-form-footer">{values.submitted?<span role="status">{t('Preview only — no message was sent.','תצוגה מקדימה בלבד — ההודעה לא נשלחה.')}</span>:null}<button type="submit" disabled={values.submitted}>{t('Send','שליחה')}</button></div>
    </form>
  </section>;
}
