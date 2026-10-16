export function timestamp(value){
  if(value===undefined||value===null||value==='')return null;
  const date=new Date(value);return Number.isFinite(date.getTime())?date:null;
}
export function dayKey(value){
  const date=timestamp(value);return date?`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`:null;
}
export function dayLabel(value,now=new Date()){
  const date=timestamp(value);if(!date)return '';
  const yesterday=new Date(now);yesterday.setDate(yesterday.getDate()-1);
  if(dayKey(date)===dayKey(now))return 'Today';
  if(dayKey(date)===dayKey(yesterday))return 'Yesterday';
  return date.toLocaleDateString(undefined,{month:'long',day:'numeric',...(date.getFullYear()!==now.getFullYear()?{year:'numeric'}:{})});
}
export function continuationQuestion(turn){
  if(!turn.answer?.trim())return turn.question;
  const question=Array.from(turn.question||'');
  const excerpt=question.length>1200?`${question.slice(0,1200).join('')} [question excerpt]`:question.join('');
  const prefix=`Continue the unfinished answer below. Start where it stopped, without repeating the existing answer or adding a preamble. Keep answering the original question from reviewed knowledge.\n\nOriginal question:\n${excerpt}\n\nExisting answer (ending):\n`;
  const room=4000-Array.from(prefix).length;
  return prefix+Array.from(turn.answer).slice(-room).join('');
}
export function appendContinuation(existing,next){
  return existing+(existing&&next&&!/\s$/.test(existing)?' ':'')+next;
}
