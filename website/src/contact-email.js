export const CONTACT_EMAIL='delmedigo.asaf@gmail.com';

export function validateContactDraft(draft){
  if(typeof draft.from!=='string'||draft.from.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.from))return 'from';
  if(typeof draft.subject!=='string'||!draft.subject.trim()||draft.subject.length>200||/[\r\n]/.test(draft.subject))return 'subject';
  if(typeof draft.body!=='string'||!draft.body.trim()||draft.body.length>4000)return 'body';
  return null;
}
export function contactMailto(draft){
  if(validateContactDraft(draft))throw Error('Please complete the contact draft.');
  const body=`Reply-to: ${draft.from.trim()}\n\n${draft.body.trim()}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(draft.subject.trim())}&body=${encodeURIComponent(body)}`;
}
