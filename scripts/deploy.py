from __future__ import annotations

import os
from pathlib import Path
import subprocess
import sys

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]
token = dotenv_values(ROOT / ".env").get("VERCEL_API_KEY")
if not token:
    raise SystemExit("Set VERCEL_API_KEY in the project .env file first.")

env = os.environ.copy()
env["VERCEL_TOKEN"] = token
result = subprocess.run(
    ["npx", "--yes", "vercel", "deploy", "--prod", "--scope", "rabota2"],
    cwd=ROOT,
    env=env,
)
sys.exit(result.returncode)
