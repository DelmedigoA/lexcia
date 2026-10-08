# Lexcia

Independent Lexcia website and embedded assistant demo. ArchiveLens is an architectural reference only.

Production site: https://lexcia.vercel.app

Vercel project: `lexcia`, in the existing `rabota2` team. The previous address, https://rabota-drab.vercel.app, remains an alias.

## Layout

- `demos/bearing-witness/`: local Bearing Witness homepage and ArchiveLens assistant demo (port 5174).
- `website/`: the current Nouva-inspired Lexcia landing page and assistant interface.
- `backend/lexcia/`: Python, Starlette/Uvicorn, Pydantic, LangGraph, and LangChain/OpenAI.
- `knowledge/`: reviewed product information, provenance, limitations, and answer instructions.
- `config/demo.yaml`: local model and backend settings.
- `docs/architecture.md`: behavior and data boundaries.

## Run

Clone the single shared repository, then run from its root (Python 3.14+ required):

```sh
git clone https://github.com/DelmedigoA/lexcia.git
cd lexcia
```

Read `CLAUDE.md` for shared development and Git collaboration rules.

```sh
uv sync
cp .env.example .env  # only if .env does not already exist
# Set OPENAI_API_KEY in .env
PYTHONPATH=backend uv run python -m lexcia
```

In a second terminal:

```sh
cd website  # from the repository root
npm install
npm run dev
```

Open http://127.0.0.1:5173. The website proxies `/api` to Lexcia on port 8767. Credentials stay in the backend's ignored `.env`, never the frontend bundle. The default configuration retains the locally used Luna model with low reasoning effort.

After dependency setup, `./scripts/dev.sh` starts both services from any directory. Stop it with Ctrl+C.

## Verify

```sh
uv run pytest
cd website
npm test
npm run build
```

## Content and demo status

The knowledge base covers Lexcia’s branding, purpose, target websites, customization offering, pricing, demo controls and implementation limits. Product positioning and pricing come from [Target Market, Problem Definition, Pricing](https://docs.google.com/document/d/1__zDd0ZhdbDSQjDmCZIFABKPeqHIL2tu1kb3rxN7dhM/edit), reviewed October 7, 2026. Early-customer and future standard pricing remain separate; API fees are billed separately. Launch dates, customers, guarantees and specific commercial integrations remain unestablished. Add reviewed product details to `knowledge/lexcia.json` as they become established.

The Vercel deployment serves the Vite site from its CDN and runs the Python ASGI chatbot in a Vercel Function. `VERCEL_API_KEY` is only used by the local Vercel CLI; `OPENAI_API_KEY` is stored as a server-side Vercel secret for Production, Preview, and Development. `.env` files are excluded from deployments.

Deployment is manual; GitHub is not connected to Vercel. On Asaf's machine, the existing project linkage and credentials remain in `/Users/delmedigo/Dev/rabota`. When deployment is requested, run `uv run python scripts/deploy.py` from that linked workspace after ensuring it contains the intended code. A fresh clone contains neither credentials nor `.vercel` linkage; do not deploy from it until the developer has configured and verified the existing `lexcia` project under `rabota2`.

The design references Nouva by Kadir Calik (https://nouva-template.framer.website/), assistant-ui (https://www.assistant-ui.com/examples/modal), and Sefaria's chatbot UI (https://github.com/Sefaria/ai-chatbot). The current public Framer hero asset and Google Fonts Onest remain remote design dependencies. Production chat session memory remains in function memory and can reset when Vercel starts a new instance; browser transcripts stay local.

Environment overrides use `LEXCIA_MODEL` and `LEXCIA_API_URL`; legacy `RABOTA_MODEL` and `RABOTA_API_URL` remain supported. Existing browser conversation history and panel preferences migrate to `lexcia:` storage keys on first load.

Chat answers hide internal citation markers and show source links directly below the answer. Sources open the raw reviewed records at `/api/knowledge/<record-id>`. Saved website source-page links are mapped back to these raw records; no separate source pages are published.

## Rabota workspace organization

All website and demo source code is grouped in this repository. The main Lexcia site stays in `website/`, with its backend, knowledge and configuration at the root. The Bearing Witness demo is in `demos/bearing-witness/`; see its README for startup instructions. ArchiveLens stays in its independent project directory. Asaf's Git checkout is `/Users/delmedigo/Dev/lexcia`; the original local deployment workspace remains `/Users/delmedigo/Dev/rabota`.

Local addresses:

- Lexcia website: http://127.0.0.1:5173 (backend: port 8767).
- Bearing Witness demo: http://127.0.0.1:5174 (ArchiveLens: port 8766).

The Bearing Witness demo is excluded from the main site's Vercel uploads. The old `Documents/ChatGPT/chatbots startup` path is a compatibility symlink to the demo directory.
