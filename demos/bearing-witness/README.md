# Bearing Witness demo

Local copy of the Bearing Witness homepage with the ArchiveLens assistant. This demo belongs to the Rabota workspace; the main Lexcia website is in `../../website`.

## Run locally

Start the existing ArchiveLens service in a terminal:

```sh
cd /Users/delmedigo/Dev/ArchiveLens
PYTHONPATH=src uv run python -m archivelens.web --config config/archive-lens.yaml --model gpt-5.6-luna --reasoning-effort low
```

Start the frontend in another terminal:

```sh
cd demos/bearing-witness  # from the Lexcia repository root
npm install
npm run dev
```

Open http://127.0.0.1:5174. The main Lexcia website uses port 5173, so both frontends can run together. Vite proxies `/api` and `/documents` to ArchiveLens on port 8766; `ARCHIVELENS_URL` overrides that target.

## Files

- `public/mirror/`: the copied Bearing Witness homepage and assets.
- `src/`: assistant interface, streaming client, and answer rendering.
- `tests/`: stream parsing and structured-output checks.
- `docs/bearing-witness-session-summary.md`: design and integration notes.
- `output/`, `artifacts/`, `bridge/`: local-only verification screenshots and meeting-document readbacks, excluded from Git.

`npm test` checks the client and answer schema. `npm run build` builds the frontend in `dist/`.

ArchiveLens remains an independent dependency at `/Users/delmedigo/Dev/ArchiveLens`; its credentials stay there. This demo uses its Bearing Witness archive and one shared in-memory conversation. The main Lexcia site has its own backend and knowledge base.

The former workspace path `/Users/delmedigo/Documents/ChatGPT/chatbots startup` is a compatibility symlink to this directory.
