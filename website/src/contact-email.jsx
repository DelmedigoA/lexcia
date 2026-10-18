// Adapted from assistant-ui Elements Draft email's Card/Form/from/to/subject/body spec.
// https://www.assistant-ui.com/elements/generative-draft-email
// Copyright (c) 2026 AgentbaseAI Inc. MIT; see public/licenses/assistant-ui.txt.
import React, {createContext, useContext, useId, useRef, useState} from 'react';
import {contactMailto, validateContactDraft} from './contact-email.js';

export const AnswerTurnContext=createContext(null);
export function DraftEmail({title,to,subject,body,language='en'}){
  const turn=useContext(AnswerTurnContext);
  const [draft,setDraft]=useState(()=>turn?.contactEmail??{from:'',subject,body,step:'form'});
  const [error,setError]=useState('');
  const id=useId(),heading=useRef(null);
  const t=(en,he)=>language==='he'?he:en;
  function update(patch){const next={...draft,...patch};if(turn)turn.contactEmail=next;setDraft(next);setError('');}
  function changeStep(step){update({step});requestAnimationFrame(()=>heading.current?.focus());}
  function review(event){
    event.preventDefault();
    const problem=validateContactDraft(draft);
    if(problem){setError(t('Please enter your email address, a subject and a message.','נא למלא כתובת אימייל, נושא והודעה.'));return;}
    changeStep('review');
  }
  function discard(){update({from:'',subject,body:'',step:'discarded'});requestAnimationFrame(()=>heading.current?.focus());}
  const reviewing=draft.step==='review';
  return <section className="contact-email" data-slot="draft-email" dir={language==='he'?'rtl':'ltr'} aria-labelledby={`${id}-title`}>
    <div className="contact-email-heading"><h3 id={`${id}-title`} tabIndex={-1} ref={heading}>{draft.step==='discarded'?t('Draft discarded','הטיוטה נמחקה'):reviewing?t('Review your email','בדיקת האימייל'):title}</h3><span className="demo-preview-badge">{t('Draft','טיוטה')}</span></div>
    {draft.step==='discarded'?<button type="button" onClick={()=>changeStep('form')}>{t('Start a new draft','יצירת טיוטה חדשה')}</button>:reviewing?<>
      <dl className="contact-email-summary"><div><dt>{t('From','מאת')}</dt><dd dir="auto">{draft.from}</dd></div><div><dt>{t('To','אל')}</dt><dd dir="ltr">{to}</dd></div><div><dt>{t('Subject','נושא')}</dt><dd dir="auto">{draft.subject}</dd></div></dl>
      <p className="contact-email-body" dir="auto">{draft.body}</p>
      <div className="contact-email-actions"><button type="button" onClick={()=>changeStep('form')}>{t('Edit draft','עריכת הטיוטה')}</button><a className="contact-email-primary" href={contactMailto(draft)}>{t('Open email app','פתיחה באפליקציית האימייל')}</a><button type="button" onClick={discard}>{t('Discard','מחיקה')}</button></div>
    </>:<form className="contact-email-form" onSubmit={review}>
      <label htmlFor={`${id}-from`}>{t('From','מאת')}<input id={`${id}-from`} name="from" type="email" autoComplete="email" required maxLength={254} placeholder={t('Your email address','כתובת האימייל שלכם')} value={draft.from} onChange={e=>update({from:e.target.value})}/></label>
      <label htmlFor={`${id}-to`}>{t('To','אל')}<input id={`${id}-to`} name="to" type="email" dir="ltr" value={to} readOnly/></label>
      <label htmlFor={`${id}-subject`}>{t('Subject','נושא')}<input id={`${id}-subject`} name="subject" dir="auto" required maxLength={200} value={draft.subject} onChange={e=>update({subject:e.target.value})}/></label>
      <label htmlFor={`${id}-body`}>{t('Message','הודעה')}<textarea id={`${id}-body`} name="body" dir="auto" required rows={5} maxLength={4000} placeholder={t('What would you like to discuss?','על מה תרצו לדבר?')} value={draft.body} onChange={e=>update({body:e.target.value})}/></label>
      {error?<p className="contact-email-error" role="alert">{error}</p>:null}
      <div className="contact-email-actions"><button type="button" onClick={discard}>{t('Discard','מחיקה')}</button><button className="contact-email-primary" type="submit">{t('Review draft','בדיקת הטיוטה')}</button></div>
    </form>}
    <p className="contact-email-note">{t('This chat does not send email. Open your email app to review and send; your reply-to address is included in the message.','הצ׳אט אינו שולח אימייל. אפשר לפתוח את הטיוטה באפליקציית האימייל, לבדוק ולשלוח; כתובתכם למענה נכללת בהודעה.')}</p>
  </section>;
}
