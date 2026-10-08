import asyncio, json, re
from collections import OrderedDict
from pathlib import Path
from uuid import UUID
from pydantic import BaseModel, Field, ValidationError
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse, PlainTextResponse, StreamingResponse
from starlette.routing import Route

class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    session_id: UUID
class ResetRequest(BaseModel):
    session_id: UUID

def sse(event, data):
    return f"event: {event}\ndata: {json.dumps(data,ensure_ascii=False)}\n\n"

def create_app(graph, knowledge):
    sessions = OrderedDict()
    def session(key):
        if key not in sessions:
            if len(sessions) >= 128:
                inactive = next((k for k,v in sessions.items() if not v["lock"].locked()), None)
                if inactive is None: return None
                del sessions[inactive]
            sessions[key] = {"history": [], "lock": asyncio.Lock()}
        sessions.move_to_end(key)
        return sessions[key]
    async def health(request):
        return JSONResponse({"ok": True, "service": "lexcia", "knowledge_records": len(knowledge.records)})
    async def source(request):
        record = next((r for r in knowledge.records if r.id == request.path_params["id"]), None)
        return PlainTextResponse(record.title + "\n\n" + record.content + "\n\n" + record.provenance) if record else JSONResponse({"error":"Unknown source"},status_code=404)
    async def chat(request):
        try: payload=ChatRequest.model_validate(await request.json())
        except (ValidationError, ValueError): return JSONResponse({"error":"A question and valid session ID are required"},status_code=400)
        question=payload.question.strip()
        if not question: return JSONResponse({"error":"Question is required"},status_code=400)
        store=session(str(payload.session_id))
        if store is None or store["lock"].locked(): return JSONResponse({"error":"Session is busy; try again"},status_code=409)
        await store["lock"].acquire()
        async def events():
            answer=""; records=[]
            try:
                yield sse("status", {"message":"Reading Lexcia information…"})
                async for event in graph.astream_events({"question":question,"history":list(store["history"])}, version="v2"):
                    if event["event"] == "on_chat_model_stream":
                        chunk=event["data"]["chunk"].content
                        text=chunk if isinstance(chunk,str) else "".join(p.get("text","") for p in chunk if isinstance(p,dict))
                        if text: yield sse("delta", {"text":text})
                    if event["event"] == "on_chain_end" and event["name"] == "retrieve":
                        records=event["data"]["output"]["records"]
                        for record in records: yield sse("item", {"item":knowledge.source(record)})
                    if event["event"] == "on_chain_end" and event["name"] == "answer":
                        answer=event["data"]["output"]["answer"]
                if not answer: raise RuntimeError("No completed answer")
                store["history"].append({"question":question,"answer":answer}); store["history"][:]=store["history"][-10:]
                cited=set(re.findall(r"\[\[SOURCE id=([a-z0-9-]+)\]\]",answer))
                yield sse("final", {"answer":answer,"items":[knowledge.source(r) for r in records if r.id in cited]})
                yield sse("done", {})
            except asyncio.CancelledError: raise
            except Exception:
                yield sse("error", {"message":"Lexcia could not complete the answer. Please try again."})
            finally: store["lock"].release()
        return StreamingResponse(events(),media_type="text/event-stream",headers={"Cache-Control":"no-cache","X-Accel-Buffering":"no"})
    async def reset(request):
        try: payload=ResetRequest.model_validate(await request.json())
        except (ValidationError, ValueError): return JSONResponse({"error":"Valid session ID required"},status_code=400)
        store=sessions.get(str(payload.session_id))
        if store and store["lock"].locked(): return JSONResponse({"error":"Session is busy"},status_code=409)
        if store: store["history"].clear()
        return JSONResponse({"ok":True})
    return Starlette(routes=[Route('/api/health',health),Route('/api/knowledge/{id}',source),Route('/api/chat/stream',chat,methods=['POST']),Route('/api/chat/reset',reset,methods=['POST'])])
