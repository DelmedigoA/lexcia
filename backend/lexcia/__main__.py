import os
from pathlib import Path
import uvicorn, yaml
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from .agent import build_agent
from .app import create_app
from .knowledge import Knowledge
ROOT=Path(__file__).resolve().parents[2]
def main():
    load_dotenv(ROOT/".env")
    config=yaml.safe_load((ROOT/"config/demo.yaml").read_text())
    if not os.getenv("OPENAI_API_KEY"): raise SystemExit(f"Set OPENAI_API_KEY in {ROOT / '.env'}")
    knowledge=Knowledge(ROOT/config["knowledge"])
    model=ChatOpenAI(model=os.getenv("LEXCIA_MODEL") or os.getenv("RABOTA_MODEL") or config["model"],reasoning_effort=config["reasoning_effort"],verbosity=config["verbosity"],use_responses_api=True,streaming=True,timeout=60,max_retries=1)
    graph=build_agent(knowledge,model,(ROOT/config["prompt"]).read_text())
    uvicorn.run(create_app(graph,knowledge),host=config["host"],port=config["port"])
if __name__=="__main__":main()
