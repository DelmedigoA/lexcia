# Terra & Mar — Portugal travel atlas

An independent, fictional travel publication with real English Wikivoyage travel
guides and individually licensed Wikimedia Commons photography. This directory is
a self-contained Next.js + TypeScript project. It has no dependency on the parent
application, backend, accounts, databases, or external APIs at runtime.

## Run and build

Node 20.9+ and npm are required.

```sh
npm ci
npm run dev
# http://localhost:5180
npm run build
```

`next build` statically generates the homepage, seven regional landing pages,
all destination guides, three collections, the atlas, About, credits and 404 into
`out/`. Serve that directory with any static host. Search fetches a local static
full-text index, matches accent-insensitive terms, and supports region/type filters.
Content and photos are checked in, so Wikimedia availability does not affect builds
or visitors. Fonts are served locally, with their OFL notices.

## Architecture

- `src/app/`: App Router pages and CSS; dynamic routes use `generateStaticParams`.
- `src/components/`: shared cards, credits, navigation, browser-side search.
- `src/lib/content.ts`: typed build-time content access.
- `content/`: one structured record per guide, catalog, geographic regions and import report.
- `public/images/`: downloaded, resized WebP photographs.
- `public/search-index.json`: local full-text index.
- `public/provenance.json`: machine-readable article revisions and image licensing.
- `public/guide-content.json`: downloadable CC BY-SA adapted guide edition.
- `pipeline/`: independent Python ingestion and validation; cache is ignored.

## Refresh content

Use Python 3.11+ with a virtual environment. From this directory:

```sh
python3 -m venv .venv
.venv/bin/pip install -r pipeline/requirements.txt
.venv/bin/python pipeline/import_content.py --limit 84
.venv/bin/python pipeline/validate.py
npm run build
.venv/bin/python pipeline/validate.py
```

The pipeline starts at Portugal, reads links from geographic sections and visits
regions in round-robin order. It checks the source `IsPartOf` hierarchy to exclude
foreign destinations and generic travel topics. The seven regions linked directly
by Portugal are explicit geographic roots (island hierarchies may follow the
Atlantic rather than national geography). It prefers named priority destinations
when they occur in the discovered graph, then follows further geographic links.
Lisbon district redirects are resolved to canonical articles. Missing or very short
articles are skipped; no travel text is fabricated.

Rendered article HTML comes from the official MediaWiki `action=parse` API. Requests
are serial, identified with a descriptive User-Agent, cached, spaced by at least
650 ms, use `maxlag=5`, and retry 429/5xx with backoff. Commons image metadata is
retrieved via `imageinfo` with `extmetadata`. Only verified CC BY, CC BY-SA, CC0 and
public-domain licenses are accepted. Failed photographs are omitted or use a
credited regional image. Text, sections, listings, links, revisions and author
histories are retained. Sanitized HTML has no scripts, widgets or remote imagery.
Imported guide links resolve locally; unimported destinations stay explicit links
to the source, rather than becoming broken local pages.

For a fresh edition, remove `pipeline/cache/` first. The cache intentionally pins
previous responses for reproducible reruns. Import reports list skipped API errors
and the discovered graph. Review the generated diff after any refresh. The article
minimum is 180 source words, which permits concise but useful small-town/island
guides alongside much longer city guides. `--limit` counts country and region guides;
canonical Lisbon district guides may take the final total slightly above this limit.

Validation checks coverage, source revisions, licenses, local photographs, search
consistency, sanitized content, guide relationships and, after a build, every local
link, image and anchor in the exported HTML.

## Deploy on GitHub Pages

The public demo is built from this directory by the repository-level workflow at
`../.github/workflows/portugal-atlas-pages.yml`. It publishes to
`https://delmedigoa.github.io/lexcia/` when changes reach the `codex/portugal-travel-atlas`
branch. GitHub Pages is set up as a separate static site; it does not replace the
Lexcia production website or use its Vercel project. The build is exported to `out/`
with `/lexcia` as its base path, including guide photos, fonts, search, and internal
links.

To place the complete atlas inside another website, add a mount element and the
hosted loader:

```html
<div id="terra-mar-atlas"></div>
<script defer src="https://delmedigoa.github.io/lexcia/terra-mar.js"></script>
```

The loader creates a responsive, titled iframe at the script's location. Change the
mount ID with `data-target` if the host page already uses `terra-mar-atlas`.

## Deploy on Vercel

Create a **separate Vercel project** with this folder (`portugal-atlas`) as its Root
Directory. Select Next.js, build with `npm run build`, output `out`. No environment
variables are required. The local `vercel.json` contains the standalone deployment
configuration; do not use the parent application's deployment script or project.
No deployment is created by the ingestion or build commands.

## Licensing and editorial boundaries

This is a clearly disclosed fictional demonstration publication, independent of
Wikimedia and official tourism bodies. Travel text is a snapshot, not a promise
that prices, operators or schedules remain current. Each guide links its source
revision and author history. The complete credits page is `/credits/`.

Wikivoyage-derived text and its adaptations: **CC BY-SA 4.0**. Photographs: each
image's own recorded license, author and Commons source. Fonts: **SIL OFL**.
Original application and pipeline code: **MIT**, see `LICENSE`. Code licensing does
not replace the content and asset licenses. If redistributing this project, retain
all provenance and license notices. Editorial framing is original; factual guide
text is imported rather than generated.
