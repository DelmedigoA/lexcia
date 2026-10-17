import json
import pytest
from lexcia.followups import AnswerStream,FOLLOWUP_MARKER,split_reply

def test_answer_and_model_suggestions_are_separated():
    payload={'suggestions':[{'prompt':'How would this work for an archive?','action':'ask'},{'prompt':'Explore my demo','action':'schedule_demo'}]}
    result=split_reply('A sourced answer. [[SOURCE id=overview]]\n\n'+FOLLOWUP_MARKER+json.dumps(payload))
    assert result['answer']=='A sourced answer. [[SOURCE id=overview]]'
    assert result['suggestions']==payload['suggestions']

@pytest.mark.parametrize('metadata',['bad json','{"suggestions":[{"prompt":"","action":"ask"}]}','{"suggestions":[{"prompt":"Run code","action":"execute"}]}'])
def test_invalid_suggestions_do_not_replace_or_break_the_answer(metadata):
    assert split_reply('Answer\n'+FOLLOWUP_MARKER+metadata)=={'answer':'Answer','suggestions':[]}
    assert split_reply('Answer')=={'answer':'Answer','suggestions':[]}

def test_suggestion_footer_never_leaks_at_any_chunk_boundary():
    answer='Visible [[SOURCE id=overview]] text.\n'
    raw=answer+FOLLOWUP_MARKER+'{"suggestions":[{"prompt":"Next?","action":"ask"}]}'
    for boundary in range(len(raw)+1):
        stream=AnswerStream()
        assert stream.feed(raw[:boundary])+stream.feed(raw[boundary:])==answer
    stream=AnswerStream()
    assert ''.join(stream.feed(character) for character in raw)==answer
