import json
from typing import TypedDict
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import START, END, StateGraph
from .followups import RESPONSE_FORMAT, split_reply
from .guard import guard_notice
class State(TypedDict, total=False):
    question: str
    history: list
    records: list
    answer: str
    suggestions: list
    guardrail: dict | None

def build_agent(knowledge, model, instructions, system="", guard=None):
    async def check_relevance(state):
        decision,unavailable=await guard.check(state['question'],state.get('history',[]))
        if decision.continue_:
            return {'guardrail':None}
        notice=guard_notice(state['question'],unavailable)
        return {'guardrail':notice,'answer':notice['explanation'],'suggestions':[],'records':[]}
    def retrieve(state):
        return {"records": knowledge.search(state["question"])}
    async def answer(state):
        context = json.dumps([r.model_dump() for r in state["records"]], ensure_ascii=False)
        messages = [SystemMessage(content=system + "\n\nConversation instructions:\n" + instructions + "\n\nResponse format:\n" + RESPONSE_FORMAT + "\n\nReviewed knowledge records:\n" + context)]
        for turn in state.get("history", [])[-10:]:
            messages.extend([HumanMessage(content=turn["question"]), AIMessage(content=turn["answer"])])
        result = await model.ainvoke([*messages, HumanMessage(content=state["question"])])
        content=result.content if isinstance(result.content,str) else "".join(part.get("text", "") for part in result.content if isinstance(part,dict))
        return split_reply(content)
    graph = StateGraph(State)
    graph.add_node("retrieve", retrieve); graph.add_node("answer", answer)
    if guard is not None:
        graph.add_node('guard',check_relevance)
        graph.add_edge(START,'guard')
        graph.add_conditional_edges('guard',lambda state:'stop' if state.get('guardrail') else 'continue',{'stop':END,'continue':'retrieve'})
    else:
        graph.add_edge(START,'retrieve')
    graph.add_edge("retrieve", "answer"); graph.add_edge("answer", END)
    return graph.compile()
