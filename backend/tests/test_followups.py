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


def test_suggestions_publish_individually_before_footer_finishes():
    first={'prompt':'How would this fit our archive?','action':'ask'}
    second={'prompt':'Schedule a demo','action':'schedule_demo'}
    stream=AnswerStream()
    prefix='Answer[[FOLLOWUPS]]{"visual":null,"suggestions":['
    assert stream.feed(prefix+json.dumps(first))=='Answer'
    assert stream.followups.drain()==[first]
    assert stream.feed(','+json.dumps(second)[:-1])==''
    assert stream.followups.drain()==[]
    assert stream.feed('}')==''
    assert stream.followups.drain()==[second]
    stream.feed(']}')
    assert stream.followups.drain()==[]


def test_incremental_footer_handles_every_boundary_and_escaped_content():
    suggestions=[{'prompt':'Could a "video" explain {this} [idea]?', 'action':'ask'}, {'prompt':'איך זה יעזור לארכיון שלנו?', 'action':'ask'}]
    raw='Visible text[[FOLLOWUPS]]'+json.dumps({'visual':'integration_diagram','suggestions':suggestions},ensure_ascii=False)
    for boundary in range(len(raw)+1):
        stream=AnswerStream();visible='';received=[]
        for chunk in [raw[:boundary],raw[boundary:]]:
            visible+=stream.feed(chunk);received+=stream.followups.drain()
        assert visible=='Visible text'
        assert received==suggestions
    stream=AnswerStream();received=[]
    for character in raw:
        stream.feed(character);received+=stream.followups.drain()
    assert received==suggestions


@pytest.mark.parametrize('visual',['contact_form','unknown'])
def test_contact_or_unknown_visual_never_streams_suggestions(visual):
    stream=AnswerStream()
    stream.feed('Answer[[FOLLOWUPS]]'+json.dumps({'visual':visual,'suggestions':[{'prompt':'Next?','action':'ask'}]}))
    assert stream.followups.drain()==[]


def test_invalid_partial_suggestions_and_legacy_footer_wait_for_final():
    for metadata in [{'suggestions':[{'prompt':'Legacy','action':'ask'}]}, {'visual':None,'suggestions':[{'prompt':'Bad','action':'execute'}]}]:
        stream=AnswerStream();stream.feed('Answer[[FOLLOWUPS]]'+json.dumps(metadata))
        assert stream.followups.drain()==[]
    stream=AnswerStream()
    duplicate={'prompt':'Next?','action':'ask'}
    stream.feed('Answer[[FOLLOWUPS]]'+json.dumps({'visual':None,'suggestions':[duplicate,duplicate,{'prompt':'Other?','action':'ask'}]}))
    assert stream.followups.drain()==[duplicate,{'prompt':'Other?','action':'ask'}]
