#!/usr/bin/env bash
set -euo pipefail
lexcia_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$lexcia_root"
PYTHONPATH=backend uv run python -m lexcia &
lexcia_api_pid=$!
trap 'kill "$lexcia_api_pid" 2>/dev/null || true' EXIT INT TERM
cd website
npm run dev
