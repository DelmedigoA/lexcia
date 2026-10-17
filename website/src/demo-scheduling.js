export function declinesDemo(question){
  return /\b(?:no thanks|no demo|don[’']?t (?:want|schedule|book)|not (?:ready|interested)|without (?:a )?demo)\b|(?:לא רוצה|לא מעוניי[נ]?ן|לא עכשיו|בלי דמו)/iu.test(question);
}
export function isDemoSchedulingQuestion(question){
  if(declinesDemo(question))return false;
  return /\b(?:schedule|book|arrange|reserve|request)\b.{0,35}\b(?:demo|demonstration)\b|\b(?:demo|demonstration)\b.{0,25}\b(?:booking|appointment)\b|(?:לקבוע|לתאם|להזמין).{0,25}(?:דמו|הדגמה)/iu.test(question);
}
export function localDateValue(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function validateDemoDraft(draft,now=new Date()){
  if(!draft.name?.trim()||!draft.email?.trim())return 'Please enter your name and email.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))return 'Please enter a valid email address.';
  if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)||!/^\d{2}:\d{2}$/.test(draft.time))return 'Choose a date and time.';
  const start=new Date(`${draft.date}T${draft.time}`);
  if(!Number.isFinite(start.getTime())||localDateValue(start)!==draft.date||`${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`!==draft.time)return 'Choose a valid local date and time.';
  if(start<=now)return 'Choose a time in the future.';
  return '';
}
