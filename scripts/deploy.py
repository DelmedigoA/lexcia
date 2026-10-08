"""Deploy the shared checkout to the existing Lexcia production project."""
from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]
TEAM_ID = "team_C8ZP7SV429G0XwwcF7duTzzQ"
TEAM_SLUG = "rabota2"
PROJECT_ID = "prj_4QuZOx4QghpXfYPFoHLHgzwVrTkY"
PROJECT_NAME = "lexcia"
CLI = ["npx", "--yes", "vercel@63.1.0"]


def load_token(root: Path) -> str:
    token = os.getenv("VERCEL_TOKEN") or os.getenv("VERCEL_API_KEY")
    for name in ("vercel.env", ".env"):
        if token:
            break
        values = dotenv_values(root / name)
        token = values.get("VERCEL_TOKEN") or values.get("VERCEL_API_KEY")
    if not token:
        raise SystemExit("Set VERCEL_TOKEN or VERCEL_API_KEY in local vercel.env or the process environment.")
    return token


def api_get(path: str, token: str) -> dict:
    request = Request("https://api.vercel.com" + path, headers={"Authorization": "Bearer " + token})
    try:
        with urlopen(request, timeout=30) as response:
            return json.load(response)
    except HTTPError as error:
        raise SystemExit(f"Vercel verification failed: HTTP {error.code}.") from None
    except URLError:
        raise SystemExit("Vercel verification failed: network unavailable.") from None


def verify_link(root: Path, token: str) -> None:
    expected = {"projectId": PROJECT_ID, "orgId": TEAM_ID, "projectName": PROJECT_NAME}
    link = root / ".vercel" / "project.json"
    if link.exists():
        current = json.loads(link.read_text())
        if any(current.get(key) != expected[key] for key in ("projectId", "orgId")):
            raise SystemExit("Local Vercel link targets another project or team; stopping.")
    project = api_get(f"/v9/projects/{PROJECT_ID}?teamId={TEAM_ID}", token)
    team = api_get(f"/v2/teams/{TEAM_ID}", token)
    if project.get("id") != PROJECT_ID or project.get("name") != PROJECT_NAME or team.get("id") != TEAM_ID or team.get("slug") != TEAM_SLUG:
        raise SystemExit("Vercel project/team verification did not match Lexcia; stopping.")
    if not link.exists():
        link.parent.mkdir(exist_ok=True)
        link.write_text(json.dumps(expected) + "\n")
    print(f"Verified production target: {TEAM_SLUG}/{PROJECT_NAME}", flush=True)


def main() -> int:
    token = load_token(ROOT)
    verify_link(ROOT, token)
    env = os.environ.copy()
    env["VERCEL_TOKEN"] = token
    env["VERCEL_ORG_ID"] = TEAM_ID
    env["VERCEL_PROJECT_ID"] = PROJECT_ID
    inspect = subprocess.run(CLI + ["project", "inspect", "--non-interactive", "--scope", TEAM_SLUG], cwd=ROOT, env=env)
    if inspect.returncode:
        return inspect.returncode
    return subprocess.run(CLI + ["deploy", "--prod", "--yes", "--scope", TEAM_SLUG], cwd=ROOT, env=env).returncode


if __name__ == "__main__":
    sys.exit(main())
