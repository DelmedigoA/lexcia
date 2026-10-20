# /// script
# requires-python = ">=3.12"
# dependencies = ["firecrawl==4.53.2"]
# ///
"""One native Firecrawl map request, saving JSON and a searchable viewer."""
import argparse
import json
from pathlib import Path
from firecrawl import Firecrawl

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", default="https://www.study.co.il/")
parser.add_argument("--output", type=Path, default=Path("output/firecrawl-map"))
args = parser.parse_args()

# Uses FIRECRAWL_API_KEY if set; otherwise tries the SDK's keyless access.
try:
    result = Firecrawl(timeout=90, max_retries=0).map(
        args.url, limit=100, sitemap="include", include_subdomains=False,
    )
except Exception as exc:
    raise SystemExit(f"Firecrawl map failed ({type(exc).__name__}). "
                     "For UnauthorizedError, set FIRECRAWL_API_KEY locally or connect Firecrawl.") from None
data = result.model_dump(mode="json", exclude_none=True)
args.output.mkdir(parents=True, exist_ok=True)
(args.output / "map.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
summary = {"url": args.url, "result_limit": 100, "returned_urls": len(data["links"]),
           "with_title": sum(bool(x.get("title")) for x in data["links"]),
           "with_description": sum(bool(x.get("description")) for x in data["links"])}
(args.output / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
template = Path(__file__).with_name("viewer.html").read_text(encoding="utf-8")
payload = json.dumps(data["links"], ensure_ascii=False).replace("<", "\\u003c")
(args.output / "map.html").write_text(template.replace("__DATA__", payload), encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))
print(f"Saved to {args.output.resolve()}")
