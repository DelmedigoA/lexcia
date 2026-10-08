"""Vercel entry point: Lexcia API plus CDN-served Vite frontend."""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from langchain_openai import ChatOpenAI
import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
load_dotenv(ROOT / ".env")

from lexcia.agent import build_agent
from lexcia.app import create_app
from lexcia.knowledge import Knowledge

config = yaml.safe_load((ROOT / "config/demo.yaml").read_text())
if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("OPENAI_API_KEY is required for Lexcia's assistant")

knowledge = Knowledge(ROOT / config["knowledge"])
model = ChatOpenAI(
    model=os.getenv("LEXCIA_MODEL") or os.getenv("RABOTA_MODEL") or config["model"],
    reasoning_effort=config["reasoning_effort"],
    verbosity=config["verbosity"],
    use_responses_api=True,
    streaming=True,
    timeout=60,
    max_retries=1,
)
starlette_api = create_app(
    build_agent(knowledge, model, (ROOT / config["prompt"]).read_text()), knowledge
)


app = FastAPI()
# Register concrete API routes before the CDN frontend fallback, preserving /api paths.
app.router.routes.extend(starlette_api.routes)
app.frontend("/", directory="website/dist")
