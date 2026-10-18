import {declinesDemo,isDemoSchedulingQuestion} from './demo-scheduling.js';

// The model supplies the content and actions; local code only validates/filter them.
export function followupSuggestions(turns){
  const last=turns.at(-1);
  if(!last||last.status!=='complete'||last.scheduling||last.ui?.$type==='ContactForm'||last.guardrail||!Array.isArray(last.suggestions))return [];
  const hasDraft=turns.some(turn=>turn.scheduling&&turn.scheduling.step!=='cancelled');
  const declined=turns.some(turn=>declinesDemo(turn.question));
  const seen=new Set();
  return last.suggestions.filter(suggestion=>{
    if(!suggestion||typeof suggestion.prompt!=='string'||!suggestion.prompt.trim()||suggestion.prompt.length>200||!['ask','schedule_demo'].includes(suggestion.action))return false;
    if(suggestion.action==='schedule_demo'&&(hasDraft||declined))return false;
    const key=suggestion.prompt.trim().toLocaleLowerCase();
    if(seen.has(key))return false;seen.add(key);return true;
  }).slice(0,3).map(suggestion=>({prompt:suggestion.prompt.trim(),action:suggestion.action}));
}

export function isSchedulingRequest(turns,question){
  const selected=followupSuggestions(turns).find(suggestion=>suggestion.prompt===question);
  return selected?selected.action==='schedule_demo':isDemoSchedulingQuestion(question);
}
