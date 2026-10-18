import asyncio, json
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
        model=FakeListChatModel(responses=['Lexcia helps visitors find content. [[SOURCE id=overview]]\n[[FOLLOWUPS]]'+json.dumps({'suggestions':[{'prompt':'How would this fit our museum?','action':'ask'},{'prompt':'Show a demo for my site','action':'schedule_demo'}]})])
        graph=build_agent(knowledge,model,(ROOT/'knowledge/instructions.md').read_text(),(ROOT/'knowledge/system.md').read_text())
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
                assert '[[FOLLOWUPS]]' not in response.text
                final=json.loads(response.text.split('event: final\ndata: ',1)[1].split('\n\n',1)[0])
                assert final['suggestions'][0]['prompt']=='How would this fit our museum?'
                assert final['suggestions'][1]['action']=='schedule_demo'
                assert final['answer'].endswith('[[SOURCE id=overview]]')
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
    assert set(links)==anchors=={'home','why','look','demo'}
    assert len(links)==len(knowledge.records)==7
    assert not {'architecture','design','experience','status','answers'} & {r.id for r in knowledge.records}
    pricing=next(r for r in knowledge.records if r.id=='pricing')
    assert 'API usage billed separately' in pricing.content
    assert '₪' not in pricing.content


def test_scope_and_progression_instructions_reach_model_with_reviewed_knowledge():
    captured=[]
    class RecordingModel:
        async def ainvoke(self,messages):
            from langchain_core.messages import AIMessage
            captured.extend(messages)
            return AIMessage(content='Answer[[FOLLOWUPS]]'+json.dumps({'suggestions':[{'prompt':'What matters for our archive?','action':'ask'}]}))
    async def scenario():
        knowledge=Knowledge(ROOT/'knowledge/lexcia.json')
        system=(ROOT/'knowledge/system.md').read_text()
        instructions=(ROOT/'knowledge/instructions.md').read_text()
        graph=build_agent(knowledge,RecordingModel(),instructions,system)
        result=await graph.ainvoke({'question':'What is Lexcia?','history':[]})
        assert result['answer']=='Answer'
        assert result['suggestions']==[{'prompt':'What matters for our archive?','action':'ask'}]
        assert len(captured)==2  # One model invocation, with system + current question.
        assert captured[0].type=='system'
        assert system in captured[0].content
        assert instructions in captured[0].content
        assert 'Reviewed knowledge records:' in captured[0].content
        assert captured[-1].content=='What is Lexcia?'
    asyncio.run(scenario())


def test_suggestion_sse_arrives_before_final_and_contains_only_complete_objects():
    async def scenario():
        expected=[{'prompt':'How does this fit our archive?','action':'ask'},{'prompt':'Schedule a demo','action':'schedule_demo'}]
        raw='An answer. [[SOURCE id=overview]][[FOLLOWUPS]]'+json.dumps({'visual':None,'suggestions':expected})
        knowledge=Knowledge(ROOT/'knowledge/lexcia.json')
        graph=build_agent(knowledge,FakeListChatModel(responses=[raw]),'Use reviewed facts.')
        async with httpx.AsyncClient(transport=httpx.ASGITransport(create_app(graph,knowledge)),base_url='http://test') as client:
            response=await client.post('/api/chat/stream',json={'question':'What is Lexcia?','session_id':str(uuid4())})
        blocks=[b for b in response.text.split('\n\n') if b]
        streamed=[json.loads(b.split('\ndata: ',1)[1])['suggestion'] for b in blocks if b.startswith('event: suggestion\n')]
        assert streamed==expected
        final_index=next(i for i,b in enumerate(blocks) if b.startswith('event: final\n'))
        assert all(i<final_index for i,b in enumerate(blocks) if b.startswith('event: suggestion\n'))
        final=json.loads(blocks[final_index].split('\ndata: ',1)[1])
        assert final['suggestions']==expected
        assert '[[FOLLOWUPS]]' not in response.text
    asyncio.run(scenario())
