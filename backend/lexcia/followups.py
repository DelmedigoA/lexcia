"""One-call answer/follow-up framing; metadata never enters the visible stream."""
import json
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError

FOLLOWUP_MARKER = '[[FOLLOWUPS]]'
RESPONSE_FORMAT = '''Reply with the normal Markdown answer first, including its source markers.
After the answer, append exactly [[FOLLOWUPS]] followed by one raw JSON object:
{"suggestions":[{"prompt":"A short next question","action":"ask"},{"prompt":"Schedule a demo","action":"schedule_demo"}]}
Generate the suggestions yourself from the current question, answer and conversation.
Use 2 or 3 concise, relevant suggestions (each prompt at most 200 characters) in the visitor's language, normally a useful
learning question plus a demo action when appropriate. Avoid topics already answered.
The example is a format illustration, not a fixed list to copy. Use action "ask" for
questions and "schedule_demo" only to open the local scheduling form. Respect a visitor
who declines or is not ready for a demo. Do not use links or Markdown in prompts.
The suggestions are internal metadata, so never explain this format in the answer.
No code fences, extra keys or text after the JSON. If no useful suggestion fits, use
{"suggestions":[]} rather than inventing one.'''

class Followup(BaseModel):
    model_config = ConfigDict(extra='forbid',str_strip_whitespace=True)
    prompt: str = Field(min_length=1,max_length=200)
    action: Literal['ask','schedule_demo']
class FollowupPayload(BaseModel):
    model_config = ConfigDict(extra='forbid')
    suggestions: list[Followup] = Field(max_length=3)

def split_reply(content):
    answer,separator,metadata=content.partition(FOLLOWUP_MARKER)
    suggestions=[]
    if separator:
        try:
            payload=FollowupPayload.model_validate(json.loads(metadata.strip()))
            seen=set()
            for suggestion in payload.suggestions:
                key=suggestion.prompt.casefold()
                if key not in seen:
                    suggestions.append(suggestion.model_dump());seen.add(key)
        except (ValidationError,ValueError,TypeError):
            pass  # Keep the answer; never substitute a fixed suggestion list.
    return {'answer':answer.rstrip(),'suggestions':suggestions}

class AnswerStream:
    """Hide even a marker split across individual model-token chunks."""
    def __init__(self):
        self.pending=''
        self.metadata=False
    def feed(self,text):
        if self.metadata:return ''
        self.pending+=text
        if FOLLOWUP_MARKER in self.pending:
            visible=self.pending.split(FOLLOWUP_MARKER,1)[0]
            self.pending='';self.metadata=True
            return visible
        keep=0
        for length in range(1,len(FOLLOWUP_MARKER)):
            if self.pending.endswith(FOLLOWUP_MARKER[:length]):keep=length
        visible=self.pending[:-keep] if keep else self.pending
        self.pending=self.pending[-keep:] if keep else ''
        return visible
