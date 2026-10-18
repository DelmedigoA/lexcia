"""One-call answer/follow-up framing; metadata never enters the visible stream."""
import json
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError

FOLLOWUP_MARKER = '[[FOLLOWUPS]]'
RESPONSE_FORMAT = '''Reply with the normal Markdown answer first, including its source markers.
After the answer, append exactly [[FOLLOWUPS]] followed by one raw JSON object:
{"visual":null,"suggestions":[{"prompt":"A short next question","action":"ask"},{"prompt":"Schedule a demo","action":"schedule_demo"}]}
Generate the suggestions yourself from the current question, answer and conversation.
Use 2 or 3 concise, relevant suggestions (each prompt at most 200 characters) in the visitor's language, normally a useful
learning question plus a demo action when appropriate. Avoid topics already answered.
The example is a format illustration, not a fixed list to copy. Use action "ask" for
questions and "schedule_demo" only to open the local scheduling form. Respect a visitor
who declines or is not ready for a demo. Do not use links or Markdown in prompts.
The suggestions are internal metadata, so never explain this format in the answer.
Write "visual" FIRST (null or a reviewed visual name), then "suggestions".
This order lets each completed suggestion appear immediately while you finish the rest.
No code fences, other extra keys or text after the JSON. If no useful suggestion fits, use
{"visual":null,"suggestions":[]} rather than inventing one.'''

class Followup(BaseModel):
    model_config = ConfigDict(extra='forbid',str_strip_whitespace=True)
    prompt: str = Field(min_length=1,max_length=200)
    action: Literal['ask','schedule_demo']
class FollowupPayload(BaseModel):
    model_config = ConfigDict(extra='forbid')
    suggestions: list[Followup] = Field(max_length=3)
    visual: Literal['integration_diagram','integration_flow','pricing_table','api_cost_chart','contact_form'] | None = None

def split_reply(content):
    answer,separator,metadata=content.partition(FOLLOWUP_MARKER)
    suggestions=[]
    visual=None
    if separator:
        try:
            payload=FollowupPayload.model_validate(json.loads(metadata.strip()))
            visual=payload.visual
            seen=set()
            for suggestion in payload.suggestions:
                key=suggestion.prompt.casefold()
                if key not in seen:
                    suggestions.append(suggestion.model_dump());seen.add(key)
        except (ValidationError,ValueError,TypeError):
            pass  # Keep the answer; never substitute a fixed suggestion list.
    result={'answer':answer.rstrip(),'suggestions':suggestions}
    if visual: result['visual']=visual
    return result

class StreamingFollowups:
    """Decode complete suggestion objects from the ordered JSON footer only."""
    def __init__(self):
        self.buffer=''
        self.sent=set()
        self.ready=[]

    def feed(self,text):
        if len(self.buffer)+len(text)>8192:return
        self.buffer+=text
        decoder=json.JSONDecoder()
        data=self.buffer
        def whitespace(index):
            while index<len(data) and data[index].isspace():index+=1
            return index
        def token(index,expected):
            index=whitespace(index)
            if not data.startswith(expected,index):raise ValueError('Incomplete footer')
            return index+len(expected)
        try:
            index=token(0,'{')
            key,index=decoder.raw_decode(data,whitespace(index))
            if key!='visual':return  # Legacy/unordered footers still work in final.
            index=token(index,':')
            visual,index=decoder.raw_decode(data,whitespace(index))
            if visual=='contact_form':return
            if visual not in (None,'integration_diagram','integration_flow','pricing_table','api_cost_chart'):return
            index=token(index,',')
            key,index=decoder.raw_decode(data,whitespace(index))
            if key!='suggestions':return
            index=token(token(index,':'),'[')
            for _ in range(3):
                index=whitespace(index)
                if data[index:index+1]==']':return
                item,index=decoder.raw_decode(data,index)
                suggestion=Followup.model_validate(item).model_dump()
                key=suggestion['prompt'].casefold()
                if key not in self.sent:
                    self.sent.add(key);self.ready.append(suggestion)
                index=whitespace(index)
                if data[index:index+1]!=',':return
                index+=1
        except (ValueError,TypeError,ValidationError):
            return  # Incomplete JSON is retried after the next chunk.

    def drain(self):
        ready,self.ready=self.ready,[]
        return ready

class AnswerStream:
    """Hide the footer and publish its validated suggestions incrementally."""
    def __init__(self):
        self.pending=''
        self.metadata=False
        self.followups=StreamingFollowups()
    def feed(self,text):
        if self.metadata:
            self.followups.feed(text)
            return ''
        self.pending+=text
        if FOLLOWUP_MARKER in self.pending:
            visible,metadata=self.pending.split(FOLLOWUP_MARKER,1)
            self.pending='';self.metadata=True
            self.followups.feed(metadata)
            return visible
        keep=0
        for length in range(1,len(FOLLOWUP_MARKER)):
            if self.pending.endswith(FOLLOWUP_MARKER[:length]):keep=length
        visible=self.pending[:-keep] if keep else self.pending
        self.pending=self.pending[-keep:] if keep else ''
        return visible
