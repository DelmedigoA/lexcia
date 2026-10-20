# Firecrawl mapping test

One native Firecrawl `/map` call for `https://www.study.co.il/`, capped at 100 returned URLs, with sitemaps included and subdomains excluded. No custom mapping logic or Lexcia integration.

Set `FIRECRAWL_API_KEY` in your local environment, then run:

```sh
uv run experiments/firecrawl-map/map_site.py
```

The SDK reads the environment variable automatically. Do not commit the key. The script does not read project `.env` files.

Outputs, on success, in ignored `output/firecrawl-map/`:

- `map.json`: unchanged native API result.
- `summary.json`: returned URL/title/description counts.
- `map.html`: standalone searchable viewer.

**October 20, 2026 test:** Firecrawl SDK 4.53.2 created a keyless client, but the actual `/map` request returned `UnauthorizedError`: mapping is not supported by the keyless free tier. No mapping results were produced. An authenticated connection/key is needed to finish the comparison. A Firecrawl plugin was offered as an alternative connection path.

The limit applies to returned URLs, not content pages crawled. `/map` is URL discovery, not a semantic hierarchy builder. [Native API documentation](https://docs.firecrawl.dev/features/map).
