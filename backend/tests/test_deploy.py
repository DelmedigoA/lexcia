"""Credential selection and deployment-target safeguards; no live Vercel calls."""
import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace

import pytest

spec = importlib.util.spec_from_file_location("deploy", Path(__file__).parents[2] / "scripts/deploy.py")
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


def test_token_file_and_environment_precedence(tmp_path, monkeypatch):
    monkeypatch.delenv("VERCEL_TOKEN", raising=False)
    monkeypatch.delenv("VERCEL_API_KEY", raising=False)
    (tmp_path / "vercel.env").write_text("VERCEL_API_KEY=file-token\n")
    (tmp_path / ".env").write_text("VERCEL_API_KEY=legacy-token\n")
    assert deploy.load_token(tmp_path) == "file-token"
    monkeypatch.setenv("VERCEL_TOKEN", "environment-token")
    assert deploy.load_token(tmp_path) == "environment-token"


def test_missing_token_stops(tmp_path, monkeypatch):
    monkeypatch.delenv("VERCEL_TOKEN", raising=False)
    monkeypatch.delenv("VERCEL_API_KEY", raising=False)
    with pytest.raises(SystemExit, match="Set VERCEL_TOKEN"):
        deploy.load_token(tmp_path)


def test_wrong_local_link_stops_before_network(tmp_path, monkeypatch):
    (tmp_path / ".vercel").mkdir()
    (tmp_path / ".vercel/project.json").write_text(json.dumps({"projectId": "other", "orgId": deploy.TEAM_ID}))
    monkeypatch.setattr(deploy, "api_get", lambda *args: pytest.fail("Must not query or deploy another project"))
    with pytest.raises(SystemExit, match="another project"):
        deploy.verify_link(tmp_path, "test-token")


def test_remote_mismatch_does_not_create_link(tmp_path, monkeypatch):
    monkeypatch.setattr(deploy, "api_get", lambda *args: {"id": "other"})
    with pytest.raises(SystemExit, match="did not match"):
        deploy.verify_link(tmp_path, "test-token")
    assert not (tmp_path / ".vercel").exists()


def test_verified_link_contains_only_metadata(tmp_path, monkeypatch):
    def api(path, token):
        return {"id": deploy.TEAM_ID, "slug": deploy.TEAM_SLUG} if path.startswith("/v2/teams/") else {"id": deploy.PROJECT_ID, "name": deploy.PROJECT_NAME}
    monkeypatch.setattr(deploy, "api_get", api)
    deploy.verify_link(tmp_path, "test-token")
    content = (tmp_path / ".vercel/project.json").read_text()
    assert "test-token" not in content
    assert json.loads(content)["projectId"] == deploy.PROJECT_ID


@pytest.mark.parametrize("inspect_code,expected_calls", [(0, 2), (1, 1)])
def test_cli_token_only_in_environment_and_inspection_gates_deploy(tmp_path, monkeypatch, inspect_code, expected_calls):
    monkeypatch.setattr(deploy, "ROOT", tmp_path)
    monkeypatch.setattr(deploy, "load_token", lambda root: "test-token")
    monkeypatch.setattr(deploy, "verify_link", lambda *args: None)
    calls = []
    def run(args, cwd, env):
        assert "test-token" not in " ".join(args)
        assert env["VERCEL_TOKEN"] == "test-token"
        assert env["VERCEL_PROJECT_ID"] == deploy.PROJECT_ID
        calls.append(args)
        return SimpleNamespace(returncode=inspect_code if len(calls) == 1 else 0)
    monkeypatch.setattr(deploy.subprocess, "run", run)
    assert deploy.main() == inspect_code
    assert len(calls) == expected_calls
