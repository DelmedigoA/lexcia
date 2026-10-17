import asyncio
from pathlib import Path
from uuid import uuid4
import httpx
from langchain_core.language_models.fake_chat_models import FakeListChatModel
from lexcia.agent import build_agent
from lexcia.app import create_app
from lexcia.knowledge import Knowledge
ROOT=Path(__file__).resolve().parents[2]
def test_sourced_stream_validation_and_session_isolation():
    async def scenario():
        knowledge=Knowledge(ROOT/'knowledge/lexcia.json')
        model=FakeListChatModel(responses=['Lexcia helps visitors find content. [[SOURCE id=overview]]'])
        graph=build_agent(knowledge,model,(ROOT/'knowledge/instructions.md').read_text())
        app=create_app(graph,knowledge)
        histories=[]
        class RecordingGraph:
            async def astream_events(self,state,**kwargs):
                histories.append(list(state['history']))
                async for event in graph.astream_events(state,**kwargs): yield event
        app=create_app(RecordingGraph(),knowledge)
        first,second=str(uuid4()),str(uuid4())
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app),base_url='http://test') as client:
            assert (await client.post('/api/chat/stream',json={'question':'hello'})).status_code==400
            assert (await client.post('/api/chat/stream',json={'question':'   ','session_id':first})).status_code==400
            for session in [first,first,second]:
                response=await client.post('/api/chat/stream',json={'question':'What is Lexcia?','session_id':session})
                assert response.status_code==200
                assert 'event: delta' in response.text and 'event: final' in response.text
                assert '"item_id": "overview"' in response.text
                assert '"url": "/api/knowledge/overview"' in response.text
            assert list(map(len,histories))==[0,1,0]
            assert (await client.post('/api/chat/reset',json={'session_id':first})).status_code==200
            await client.post('/api/chat/stream',json={'question':'What is Lexcia?','session_id':first})
            assert histories[-1]==[]
            assert 'conversational layer' in (await client.get('/api/knowledge/overview')).text
            assert (await client.get('/api/knowledge/unknown')).status_code==404
    asyncio.run(scenario())
def test_landing_knowledge_links_resolve_and_old_corpus_is_removed():
    import re
    knowledge=Knowledge(ROOT/'knowledge/lexcia.json')
    html=(ROOT/'website/index.html').read_text()
    anchors=set(re.findall(r'<section[^>]* id="([^"]+)"',html.split('</main>')[0]))
    links=[]
    for record in knowledge.records:
        links.extend(re.findall(r'\]\(#([^)]*)\)',record.content))
    assert set(links)==anchors
    assert len(links)==len(knowledge.records)==7
    assert not {'architecture','design','experience','status','answers'} & {r.id for r in knowledge.records}
    pricing=next(r for r in knowledge.records if r.id=='pricing')
    assert 'API usage billed separately' in pricing.content
    assert '₪' not in pricing.content
