import json
from typing import TypedDict
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import START, END, StateGraph
class State(TypedDict, total=False):
    question: str
    history: list
    records: list
    answer: str

def build_agent(knowledge, model, instructions):
    def retrieve(state):
        return {"records": knowledge.search(state["question"])}
    async def answer(state):
        context = json.dumps([r.model_dump() for r in state["records"]], ensure_ascii=False)
        messages = [SystemMessage(content=instructions + "\n\nReviewed knowledge records:\n" + context)]
        for turn in state.get("history", [])[-10:]:
            messages.extend([HumanMessage(content=turn["question"]), AIMessage(content=turn["answer"])])
        result = await model.ainvoke([*messages, HumanMessage(content=state["question"])])
        return {"answer": result.content if isinstance(result.content,str) else "".join(part.get("text", "") for part in result.content if isinstance(part,dict))}
    graph = StateGraph(State)
    graph.add_node("retrieve", retrieve); graph.add_node("answer", answer)
    graph.add_edge(START, "retrieve"); graph.add_edge("retrieve", "answer"); graph.add_edge("answer", END)
    return graph.compile()
