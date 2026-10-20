# Lexcia

> **Production migration — October 20, 2026:** The active application is now split into [Lexcia-AI/site](https://github.com/Lexcia-AI/site), [Lexcia-AI/widget](https://github.com/Lexcia-AI/widget) and [Lexcia-AI/engine](https://github.com/Lexcia-AI/engine), each with its own Vercel deployment. The website remains https://lexcia.vercel.app. Read the new repositories' README/CLAUDE.md for active setup and deployment. The monolithic instructions below are historical; do not run this checkout's legacy deployment script against the migrated production site.

Independent Lexcia website and embedded assistant demo. ArchiveLens is an architectural reference only.

Production site: https://lexcia.vercel.app

Vercel project: `lexcia`, in the existing `rabota2` team. The previous address, https://rabota-drab.vercel.app, remains an alias.

## Layout

- `demos/bearing-witness/`: local Bearing Witness homepage and ArchiveLens assistant demo (port 5174).
- `website/`: the four-section Lexcia landing page and latest assistant interface.
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

## Crawl4AI experiment

From the repository root:

```sh
uv run scripts/crawl4ai_test.py
```

The script prints the Lexcia website as Markdown and saves it to `output/crawl4ai.md`
(overwritten on each successful run). Change `URL` in the script to try another page.
It uses Crawl4AI's [simple crawling API](https://docs.crawl4ai.com/core/simple-crawling/).
Dependencies run in an isolated Python 3.12 environment managed by `uv`.
On another machine, install the browsers once before running:

```sh
uv run --no-project --python 3.12 --with crawl4ai crawl4ai-setup
```

## Verify

```sh
uv run pytest
cd website
npm test
npm run build
```

## Content and demo status

The knowledge base contains seven short records covering the landing-page sections. Answers give brief explanations; follow-up suggestions offer learning and demo actions, without automatic links or click invitations in the answer. Starter questions cover what Lexcia is, who it is for, customization, and pricing. Pricing is limited to a planned setup fee plus monthly subscription, separate API usage and discounted early-organization terms; reviewed approximate USD price ranges are included. Its link points to the free-demo invitation at `#demo`, which has no price list. Schedule a demo opens an in-chat local scheduling preview, adapted from assistant-ui’s Table reservation and Create event examples. It collects preferred details and shows an event summary with a details table. The preview requires no model API, stores state only in page memory, and has no calendar, availability, email, or booking integration. The corpus also covers the proposed lightweight snippet integration, close customer collaboration, and free tailored demos with initial design and basic knowledge-base integration. Instructions encourage warm enthusiasm for the new project and concrete benefits, with demo invitations as the primary website goal. The former internal architecture, visual-design and demo-control knowledge remains outside the active corpus.

The Vercel deployment serves the Vite site from its CDN and runs the Python ASGI chatbot in a Vercel Function. `VERCEL_API_KEY` is only used by the local Vercel CLI; `OPENAI_API_KEY` is stored as a server-side Vercel secret for Production, Preview, and Development. `.env` files are excluded from deployments.

Deployment is manual; GitHub is not connected to Vercel. Asaf and Nadav can deploy from their repository clone with `uv run python scripts/deploy.py`, using a private local `vercel.env` token file. The script verifies the existing `rabota2/lexcia` project, initializes local linkage when absent, and deploys the main website/API. See [docs/deployment.md](docs/deployment.md) for setup, checks and verification. The demo and Bolt website are excluded.

The design references Nouva by Kadir Calik (https://nouva-template.framer.website/), assistant-ui (https://www.assistant-ui.com/examples/modal), and Sefaria's chatbot UI (https://github.com/Sefaria/ai-chatbot). The current public Framer hero asset and Google Fonts Onest remain remote design dependencies. Production chat session memory remains in function memory and can reset when Vercel starts a new instance; browser transcripts and layout preferences last only until page reload.

Environment overrides use `LEXCIA_MODEL` and `LEXCIA_API_URL`; legacy `RABOTA_MODEL` and `RABOTA_API_URL` remain supported. Each page load clears former `lexcia:` and `rabota:` assistant storage keys, creates a new chat session, and restores default layout settings. The website writes no cookies or persistent browser state.

Chat answers hide internal citation markers and the separate Sources footer. Copy and feedback buttons are currently removed from the thread. Visible Markdown links point to landing-page sections and render as inline bold, underlined text while preserving natural link wording. On desktop, following one pins the assistant to the right at 30% of the viewport, reflows the page alongside it, and focuses the destination heading. The launcher is hidden while pinned and returns on unpin or close. Mobile keeps the full-width floating layout and closes it before jumping. Starting demo scheduling also pins the desktop assistant at 30% width, preserving a manually wider sidebar, and opens the local preview. Model scope lives in `knowledge/system.md`; `knowledge/instructions.md` keeps answers brief and lets the follow-up suggestions provide next steps toward learning or demo scheduling. Relevant links can naturally guide visitors to the current #home, #why, #look and #demo sections. Both are loaded into the system context. After completed answers, assistant-ui runtime follow-up buttons display prompts generated by the LLM in the same call as the answer, with contextual learning questions and a demo action when appropriate. The backend validates and removes a hidden metadata footer before sending visible text; the final SSE event carries the suggestions separately. No fixed topic list or extra model call is used. Suggestions preserve the model’s language and wording, hide during replies/scheduling forms, and omit duplicate or declined demo offers. Source metadata and `/api/knowledge/<record-id>` remain available for provenance.

## Rabota workspace organization

All website and demo source code is grouped in this repository. The main Lexcia site stays in `website/`, with its backend, knowledge and configuration at the root. The Bearing Witness demo is in `demos/bearing-witness/`; see its README for startup instructions. ArchiveLens stays in its independent project directory. Asaf's Git checkout is `/Users/delmedigo/Dev/lexcia`; the original local deployment workspace remains `/Users/delmedigo/Dev/rabota`.

Local addresses:

- Lexcia website: http://127.0.0.1:5173 (backend: port 8767).
- Bearing Witness demo: http://127.0.0.1:5174 (ArchiveLens: port 8766).

The Bearing Witness demo is excluded from the main site's Vercel uploads. The old `Documents/ChatGPT/chatbots startup` path is a compatibility symlink to the demo directory.

The new website uses our established floating Lexcia assistant and pinned sidebar, restored from the pre-merge implementation (`7b26b87`). Nadav’s hero-embedded chat and animated hero mockup are removed. The same latest assistant opens automatically after half a second on desktop and mobile, preserving conversation, local forms and visuals across close/reopen and pinning. The page’s Free demo form opens an email draft to `lexcia.bots@gmail.com` for the visitor to send; the chat’s contact and scheduling forms remain local previews.
