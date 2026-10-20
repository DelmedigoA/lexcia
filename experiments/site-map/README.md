# Crawl4AI native website mapping test

A small standalone test of **Crawl4AI 0.9.5's `DomainMapper.scan()`**. No Lexcia imports, LLM, custom classifier, sitemap parser or hierarchy builder.

```sh
uv run experiments/site-map/map_site.py
# Optional:
uv run experiments/site-map/map_site.py --host example.com --output output/example-map
```

The native mapper combines **sitemap discovery and homepage link extraction**, normalizes and deduplicates the results, and returns at most 100 URLs. Head extraction, subdomain enumeration and path probing are disabled. A small HTTP request hook adds robots.txt enforcement and two-second spacing, including redirects. No browser installation is needed for this configuration.

Outputs in ignored `output/crawl4ai-map/`:

- `map.json`: native Crawl4AI results, unchanged.
- `summary.json`: counts and discovery sources.
- `map.html`: a self-contained, searchable viewer of those results.

The 100-URL setting limits **returned results**, not a 100-page content crawl. Sitemap and homepage discovery use HTTP. This deliberately tests the built-in mapper itself. It does not infer categories or reconstruct a hierarchy/link graph; doing that requires additional crawling and interpretation.

See `REPORT.md` for the actual study.co.il result. [Crawl4AI's domain-mapping documentation](https://docs.crawl4ai.com/core/domain-mapping/) describes the native API.
