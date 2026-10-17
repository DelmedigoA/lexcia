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
export function createDemoSlots(now=new Date(),random=Math.random){
  const slots=[];
  for(let offset=1;slots.length<6;offset++){
    const day=new Date(now.getFullYear(),now.getMonth(),now.getDate()+offset);
    if(day.getDay()===0||day.getDay()===6)continue;
    const hours=[9,10,11,13,14,15,16];
    for(let count=0;count<2;count++){
      const hour=hours.splice(Math.floor(random()*hours.length),1)[0];
      const time=`${String(hour).padStart(2,'0')}:${random()<0.5?'00':'30'}`;
      slots.push({date:localDateValue(day),time});
    }
  }
  return slots.sort((a,b)=>`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
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
