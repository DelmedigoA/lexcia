# Lexcia shared reference

For Codex (Asaf) and Claude Code (Nadav). Verified 2026-10-08; update this file when project facts change. `AGENTS.md` delegates here.

## Decisions and shared documents

- [Shared Lexcia Drive folder](https://drive.google.com/drive/folders/1V4Gqc3diM0SH8q8hzC20FMLtKb-OxOON), currently titled **Chatbots**.
- [Target Market, Problem Definition, Pricing](https://docs.google.com/document/d/1__zDd0ZhdbDSQjDmCZIFABKPeqHIL2tu1kb3rxN7dhM/edit?usp=drivesdk): product positioning, Lexcia branding, offering and pricing. Keep early-customer and future standard pricing distinct; API usage is separate.
- [Meetings](https://drive.google.com/drive/folders/18oHx2GGFm-vUj4zwvNi1h_n8tRgWP-ry): dated decisions and action items. Read the latest relevant notes, including **2026-10-07 - Customer Outreach**, **2026-09-29 - Product Design.md**, and **2026-09-04 - Project Definition.md**. Record new shared product decisions here; ask the developer when sources conflict.
- [Prospects](https://docs.google.com/spreadsheets/d/1tL1fJkNHJ4QJGseAcQFvREClAaHdLddW4KC6oDjrWOw/edit?usp=drivesdk): outreach tracking. [Outreach Emails](https://drive.google.com/drive/folders/1CnMzfuI7-whvkCkOF_-cnxi7T5j2-gM1): email drafts. These materials are shared working documents; do not copy private prospect data into Git.

## Repository and application layout

The single shared repository is [DelmedigoA/lexcia](https://github.com/DelmedigoA/lexcia), under Asaf's personal account. **We are not using a GitHub organization.** Both developers collaborate in this repository.

The application code, tests and source assets are tracked here. Asaf's shared-repository checkout is `/Users/delmedigo/Dev/lexcia`; `/Users/delmedigo/Dev/rabota` remains the original local application/deployment workspace and is not a Git checkout. Develop in a clone of this repository and do not upload the surrounding `Dev` directory. Credentials, generated output and local Drive readbacks are excluded.

Repository layout:

- `website/`: Vite + React landing page and assistant; `backend/lexcia/`: Python 3.14+, Starlette/Uvicorn, Pydantic and LangGraph/LangChain/OpenAI.
- `knowledge/lexcia.json` and `knowledge/instructions.md`: reviewed product facts, provenance and answer boundaries; `config/demo.yaml`: model/backend settings.
- `api/index.py` and `vercel.json`: Vercel entry point/build; `scripts/dev.sh` and `scripts/deploy.py`: local launch/deployment.
- `backend/tests/` and `website/tests/`: tests; `docs/architecture.md` and `README.md`: implementation and setup.
- `demos/bearing-witness/`: separate local integration exercise, excluded from the Lexcia deployment. ArchiveLens is an external architectural reference; the Lexcia backend runs independently.
- `bolt-project/`: Nadav's website, made in Bolt (Vite, React, TypeScript and Tailwind), separate from the deployed `website/`. **Inspect, reference, reuse or modify its code only when Asaf or Nadav explicitly asks.** Do not use it as a default reference or integrate it into the main website without that request. When requested, use `npm ci`, `npm run dev` from that directory; verify with `npm run lint`, `npm run typecheck` and `npm run build`.

## Development conventions

From the application root: `uv sync`; create `.env` from `.env.example` only if absent; then `cd website && npm ci`. Run `./scripts/dev.sh` from the root. Website: `http://127.0.0.1:5173`; backend: port 8767. Bearing Witness uses port 5174 and an external ArchiveLens backend on 8766.

Keep changes focused, follow surrounding Python/JavaScript/JSX conventions, and retain dependency lockfiles. Ground assistant answers in reviewed knowledge; preserve source links, input validation, session isolation and keyboard accessibility. Server conversation state is in memory, browser transcripts are local, and no durable account/history system exists. Update the relevant knowledge records and docs when behavior or product facts change; never invent capabilities or commercial claims.

Before pushing relevant application changes, run `uv run pytest` and `(cd website && npm test && npm run build)`; for demo changes also run its `npm test` and `npm run build`. For documentation-only changes, verify links/paths and run `git diff --check`. Run commands in the actual application checkout, not an unrelated parent repository.

## Vercel and credentials

- Verified team: **Rabota**, slug `rabota2`; its sole project is **lexcia**, ID `prj_4QuZOx4QghpXfYPFoHLHgzwVrTkY`. A Vercel team is separate from a GitHub organization.
- Production: [lexcia.vercel.app](https://lexcia.vercel.app); retained alias: [rabota-drab.vercel.app](https://rabota-drab.vercel.app). Both domains are verified; no custom domain was listed.
- Latest verified production deployment: [lexcia-gimkgjezk-rabota2.vercel.app](https://lexcia-gimkgjezk-rabota2.vercel.app), status `READY`, source `cli`. There is **no Git integration**; pushing GitHub does not currently deploy. Check live project metadata before relying on this dated deployment snapshot.
- Deployment is manual via `uv run python scripts/deploy.py` from the application root; it targets production in `rabota2`. Do not deploy or change infrastructure without a developer request. Vercel serves the Vite build and Python API; the demo is excluded.
- Asaf's existing local credentials are managed in `/Users/delmedigo/Dev/rabota/.env`. Each clone needs its own ignored application-root `.env`; credentials and Vercel linkage are not copied with the source. `VERCEL_API_KEY` is read by `scripts/deploy.py` and passed as process environment variable `VERCEL_TOKEN`; never put it in command arguments or output. `.vercel/project.json` stores local project linkage, not the token. The existing Vercel link is in the original `rabota` workspace; do not deploy from an unlinked clone or create/change linkage without a developer request.
- `OPENAI_API_KEY` is local in `.env` and managed as a sensitive server-side Vercel environment variable for Production, Preview and Development. Never expose it to the frontend. No shared credential vault or Nadav-specific credential location was verified; ask the developer for access rather than guessing.
- Never print, document, commit or upload secret values or local `.env` files. Before staging, confirm secrets and generated files are ignored; stage explicit paths only. Only a value-free `.env.example` belongs in Git.

## Git collaboration rules

1. Before starting, inspect status and remotes, then `git fetch origin` and `git pull --ff-only` on the working branch. If histories diverge, inspect and reconcile first. An empty repository has nothing to pull; fetch before its first commit.
2. Commit and push all completed changes with descriptive commit messages. Use `codex/` for new Codex branches; push the branch and communicate it. Never include another developer's unfinished work.
3. Never force-push, rewrite shared history or overwrite another developer's changes.
4. If a push is rejected, fetch, inspect incoming changes and reconcile before retrying; rerun relevant checks after reconciliation.
5. For conflicts, inspect both versions, their common ancestor and commit history. Resolve automatically only when both changes can safely coexist.
6. If changes contradict each other or intended behavior is unclear, stop and ask the developer. Never arbitrarily select one version or discard work.
7. Run relevant tests before pushing, review the staged diff, and never commit secrets or local `.env` files.
