# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["crawl4ai==0.9.5", "httpx>=0.28,<0.29"]
# ///
"""Test Crawl4AI's built-in domain mapping. No custom architecture inference."""
import argparse
import asyncio
from collections import Counter
import json
from pathlib import Path
import time
from urllib.parse import unquote, urlsplit
from urllib.robotparser import RobotFileParser

from crawl4ai import DomainMapper, DomainMapperConfig
import httpx


async def main(args):
    args.output.mkdir(parents=True, exist_ok=True)
    root = f"https://{args.host}"
    user_agent = "Crawl4AI-MapExperiment/1.0"
    robots = RobotFileParser()
    async with httpx.AsyncClient(headers={"User-Agent": user_agent}, timeout=20) as client:
        response = await client.get(root + "/robots.txt")
        if response.status_code == 404:
            robots.parse(["User-agent: *", "Allow: /"])
        else:
            response.raise_for_status()
            robots.parse(response.text.splitlines())
    delay = max(2, robots.crawl_delay(user_agent) or 0)
    lock = asyncio.Lock()
    last_request = 0

    # The native mapper doesn't enforce robots itself. Gate its HTTP requests,
    # including redirects, and apply one conservative rate limit to all discovery.
    async def respect_site(request):
        nonlocal last_request
        url = str(request.url)
        private = unquote(urlsplit(url).path).lower().split("/")
        if (urlsplit(url).hostname != args.host or not robots.can_fetch(user_agent, url)
                or any(p in {"admin", "login", "account", "dashboard"} for p in private)):
            raise httpx.RequestError("Outside public crawl scope", request=request)
        async with lock:
            await asyncio.sleep(max(0, delay - (time.monotonic() - last_request)))
            last_request = time.monotonic()

    async with httpx.AsyncClient(headers={"User-Agent": user_agent}, timeout=20,
                                 event_hooks={"request": [respect_site]}) as client:
        async with DomainMapper(client=client) as mapper:
            results = await mapper.scan(args.host, DomainMapperConfig(
                source="sitemap+homepage",
                include_subdomains=False,
                max_urls=100,
                extract_head=False,
                soft_404_detection=False,
                concurrency=1,
                hits_per_sec=1,
                force=True,
            ))
    # Save the native result as-is: normalization/deduplication are Crawl4AI's.
    (args.output / "map.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    summary = {"host": args.host, "crawl4ai_version": "0.9.5", "result_limit": 100,
               "discovered_urls": len(results), "sources": dict(Counter(r["source"] for r in results))}
    (args.output / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    template = Path(__file__).with_name("viewer.html").read_text(encoding="utf-8")
    payload = json.dumps(results, ensure_ascii=False).replace("<", "\\u003c")
    (args.output / "map.html").write_text(template.replace("__DATA__", payload), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"Saved to {args.output.resolve()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="www.study.co.il")
    parser.add_argument("--output", type=Path, default=Path("output/crawl4ai-map"))
    asyncio.run(main(parser.parse_args()))
