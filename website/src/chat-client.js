export function parseEvent(block) {
  let event='message'; const data=[];
  for (const line of block.split('\n')) {
    if(line.startsWith('event:'))event=line.slice(6).trim();
    if(line.startsWith('data:'))data.push(line.slice(5).trimStart());
  }
  return data.length ? {event,data:JSON.parse(data.join('\n'))} : null;
}
export async function readEvents(body, onEvent) {
  const reader=body.getReader(), decoder=new TextDecoder();let buffer='';
  try {
    while(true){const {done,value}=await reader.read();buffer+=decoder.decode(value,{stream:!done});buffer=buffer.replace(/\r\n/g,'\n');let end;while((end=buffer.indexOf('\n\n'))!==-1){const event=parseEvent(buffer.slice(0,end));buffer=buffer.slice(end+2);if(event)onEvent(event);}if(done)break;}
    if(buffer.trim()){const event=parseEvent(buffer);if(event)onEvent(event);}
  } finally {reader.releaseLock();}
}
export async function askLexcia(question, onEvent, signal, sessionId) {
  const response=await fetch('/api/chat/stream',{method:'POST',headers:{'Content-Type':'application/json',Accept:'text/event-stream'},body:JSON.stringify({question, session_id:sessionId}),signal});
  if(!response.ok || !response.body)throw Error('Lexcia is unavailable. Please try again.');
  let final=false;
  await readEvents(response.body,event=>{if(event.event==='error')throw Error(event.data.message || 'Lexcia could not complete the answer.');if(event.event==='final')final=true;onEvent(event);});
  if(!final)throw Error('The connection ended before the answer was complete. Please try again.');
}
export async function resetLexcia(sessionId){const response=await fetch('/api/chat/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:sessionId})});if(!response.ok)throw Error('Could not start a new conversation.');}
