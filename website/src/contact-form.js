export const CONTACT_EMAIL='delmedigo.asaf@gmail.com';

export function validateContactForm(draft){
  if(typeof draft.email!=='string'||draft.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))return 'email';
  if(typeof draft.subject!=='string'||!draft.subject.trim()||draft.subject.length>200||/[\r\n]/.test(draft.subject))return 'subject';
  if(typeof draft.content!=='string'||!draft.content.trim()||draft.content.length>4000)return 'content';
  return null;
}
