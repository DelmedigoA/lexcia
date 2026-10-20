# Native Crawl4AI mapping result — October 20, 2026

Ran `uv run experiments/site-map/map_site.py` against `www.study.co.il` using Crawl4AI 0.9.5, with `source="sitemap+homepage"`, no subdomains/probing/head extraction, and a 100-result cap.

| Native result | Count |
|---|---:|
| Discovered URLs | 97 |
| Homepage source | 97 |
| Sitemap source | 0 |

This is the native mapper output, without custom discovery or classification. The site has nonstandard sitemap paths such as `/SiteMapXML/`; this native run did not discover URLs through them. Zero sitemap results does not mean the site has no sitemap.

**Conclusion:** Crawl4AI can discover and deduplicate website URLs and record discovery sources. This API returns a flat URL inventory, not the site's information architecture. It supplies neither page-to-page edges nor inferred categories in this configuration. Those require additional extraction and interpretation, which this simplified experiment intentionally omits.

The saved native `status` field is not proof that every discovered page was fetched or checked. This run fetched discovery resources, not 97 content pages. Exact-host scope and robots checks are enforced; requests are spaced at least two seconds apart.

Local artifacts:

- `output/crawl4ai-map/map.json` — native results.
- `output/crawl4ai-map/summary.json` — counts.
- `output/crawl4ai-map/map.html` — searchable standalone viewer.

These outputs are ignored by Git. The experiment has no Lexcia integration.
