# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["crawl4ai"]
# ///
"""Run from the repository root: uv run scripts/crawl4ai_test.py"""

import asyncio
from pathlib import Path

from crawl4ai import AsyncWebCrawler

URL = "https://news.ycombinator.com"
OUTPUT = Path(__file__).resolve().parents[1] / "output" / "crawl4ai.md"


async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=URL)
        if not result.success:
            raise RuntimeError(result.error_message)

        markdown = result.markdown.raw_markdown
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(markdown, encoding="utf-8")
        print(markdown)
        print(f"\nSaved to {OUTPUT}")


if __name__ == "__main__":
    asyncio.run(main())
