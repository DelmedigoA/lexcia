import asyncio
import json
from decimal import Decimal
from pathlib import Path
from uuid import uuid4

import httpx
import pytest
from langchain_core.language_models.fake_chat_models import FakeListChatModel
from lexcia.agent import build_agent
from lexcia.app import create_app
from lexcia.followups import AnswerStream, split_reply
from lexcia.knowledge import Knowledge
from lexcia.visuals import reviewed_visual, api_cost

ROOT=Path(__file__).resolve().parents[2]

@pytest.mark.parametrize('name,component',[('integration_diagram','Diagram'),('integration_flow','FlowGraph'),('pricing_table','DataTable'),('api_cost_chart','Chart'),('contact_form','ContactForm')])
def test_model_choice_reaches_final_sse_as_reviewed_data_without_leaking_metadata(name,component):
    async def scenario():
        metadata=json.dumps({'suggestions':[],'visual':name})
        raw='A short answer. [[SOURCE id=pricing]][[FOLLOWUPS]]'+metadata
        knowledge=Knowledge(ROOT/'knowledge/lexcia.json')
        graph=build_agent(knowledge,FakeListChatModel(responses=[raw]),'Use reviewed visuals.')
        app=create_app(graph,knowledge)
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app),base_url='http://test') as client:
            response=await client.post('/api/chat/stream',json={'question':'Explain this.','session_id':str(uuid4())})
        events=[json.loads(block.split('\ndata: ',1)[1]) for block in response.text.split('\n\n') if block.startswith('event: final')]
        assert len(events)==1
        assert events[0]['ui']['$type']==component
        assert events[0]['ui']==reviewed_visual(name)
        assert events[0]['answer']=='A short answer. [[SOURCE id=pricing]]'
        assert '[[FOLLOWUPS]]' not in response.text
        for boundary in range(len(raw)+1):
            stream=AnswerStream()
            assert stream.feed(raw[:boundary])+stream.feed(raw[boundary:])=='A short answer. [[SOURCE id=pricing]]'
    asyncio.run(scenario())

def test_usd_only_prices_and_api_sample_math_remain_distinct():
    table=reviewed_visual('pricing_table')
    assert table['rows']==[
        {'plan':'Early customers','setup':'$810–$2,430','monthly':'$80–$240'},
        {'plan':'Future standard pricing','setup':'$3,240–$8,090','monthly':'$320–$810'},
    ]
    for hebrew in [False,True]:
        visible=json.dumps(reviewed_visual('pricing_table',hebrew=hebrew),ensure_ascii=False)
        assert not any(term in visible for term in ['₪','ILS','3.089'])
    assert api_cost(750,Decimal('1.82'))==1.37
    assert api_cost(750,Decimal('3.05'))==2.29
    chart=reviewed_visual('api_cost_chart')
    assert next(p for p in chart['data'] if p['label']=='750')=={'label':'750','value':1.37,'highValue':2.29}
    assert 'not a live tariff' in chart['source']
    assert 'API usage is separate' in reviewed_visual('pricing_table')['source']


def test_unknown_model_visual_cannot_supply_arbitrary_markup():
    assert split_reply('Answer[[FOLLOWUPS]]'+json.dumps({'suggestions':[],'visual':'<script>'}))=={'answer':'Answer','suggestions':[]}
    assert reviewed_visual('<script>') is None
    assert reviewed_visual('pricing_table',hebrew=True)['rows'][0]['plan']=='לקוחות ראשונים'
