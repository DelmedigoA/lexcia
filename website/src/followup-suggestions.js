import {isHebrewDominant} from './formatting.js';
import {declinesDemo} from './demo-scheduling.js';

const topics=[
  {ids:['overview','problem'],hash:'#about',prompt:'What is Lexcia?',he:'מה זה Lexcia?'},
  {ids:['target-market'],hash:'#for',prompt:'Which websites is it for?',he:'לאילו אתרים Lexcia מתאימה?'},
  {ids:['customization'],hash:'#offer',prompt:'What can Lexcia customize?',he:'מה אפשר להתאים אישית ב-Lexcia?'},
  {ids:['how'],hash:'#how',prompt:'How does integration work?',he:'איך משלבים את Lexcia באתר קיים?'},
  {ids:['pricing'],hash:'#contact',prompt:'How does pricing work?',he:'איך עובד התמחור?'},
  {ids:['demo'],hash:'#demo',prompt:'What would you show in a demo for our website?',he:'מה תציגו בדמו מותאם לאתר שלנו?'},
];
export function followupSuggestions(turns){
  const last=turns.at(-1);
  if(!last||last.status!=='complete'||last.scheduling)return [];
  const hebrew=isHebrewDominant(last.question);
  const explored=new Set();
  for(const turn of turns){
    if(turn.status!=='complete')continue;
    for(const topic of topics){
      if(turn.items?.some(item=>topic.ids.includes(item.item_id))||turn.answer?.includes(`](${topic.hash})`)||[topic.prompt,topic.he].includes(turn.question))explored.add(topic);
    }
  }
  const next=topics.find(topic=>!explored.has(topic));
  const suggestions=next?[{prompt:hebrew?next.he:next.prompt}]:[];
  const hasDraft=turns.some(turn=>turn.scheduling&&turn.scheduling.step!=='cancelled');
  if(!hasDraft&&!turns.some(turn=>declinesDemo(turn.question)))suggestions.push({prompt:hebrew?'לתאם דמו':'Schedule a demo'});
  return suggestions;
}
