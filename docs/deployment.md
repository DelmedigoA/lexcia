# Deploy Lexcia to Vercel

> **Production migration — October 20, 2026:** The active application is now split into [Lexcia-AI/site](https://github.com/Lexcia-AI/site), [Lexcia-AI/widget](https://github.com/Lexcia-AI/widget) and [Lexcia-AI/engine](https://github.com/Lexcia-AI/engine), each with its own Vercel deployment. The website remains https://lexcia.vercel.app. Read the new repositories' README/CLAUDE.md for active setup and deployment. The monolithic instructions below are historical; do not run this checkout's legacy deployment script against the migrated production site.

Asaf and Nadav use the same repository and existing `rabota2/lexcia` production project. This deploys `website/` and the Python API. Nadav's `bolt-project/` and the Bearing Witness demo are excluded. GitHub pushes do not currently trigger deployment.

Prerequisites: Python 3.14+, `uv`, Node.js/npm, and an authorized Vercel token with access to the Rabota team. In your clone, create a local `vercel.env` containing a `VERCEL_TOKEN` or `VERCEL_API_KEY` assignment. Obtain credentials privately; never put the value in chat, Git, command arguments or frontend code. This file is excluded from Git and Vercel uploads. The server's `OPENAI_API_KEY` is already configured on Vercel.

From the repository root:

```sh
git fetch origin
git pull --ff-only
uv sync --frozen
uv run pytest
(cd website && npm ci && npm test && npm run build)
# Commit and push any completed source changes before deploying.
uv run python scripts/deploy.py
```

The script reads the token from the process environment first, then `vercel.env`, then legacy `.env`. It checks the existing project/team through Vercel's API, creates an ignored local `.vercel/project.json` only when absent, and stops on a different local link or a target mismatch. It uses Vercel CLI 63.1.0, inspects the linked project, then deploys to production. It does not create a project or change environment variables/domains.

Confirm the CLI reports success and verify [the production website](https://lexcia.vercel.app), `/api/health`, and a sourced assistant answer. The prior alias is [rabota-drab.vercel.app](https://rabota-drab.vercel.app). Update shared documentation if project facts change.
