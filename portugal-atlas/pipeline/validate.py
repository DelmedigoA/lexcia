#!/usr/bin/env python3
"""Validate the local edition and, if present, every exported internal link."""

import json, re, sys
from pathlib import Path
from urllib.parse import unquote, urlsplit
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]


def read(p):
    return json.loads(p.read_text())


catalog = read(ROOT / "content/catalog.json")
regions = read(ROOT / "content/regions.json")
errors = []
warnings = []


def check(condition, message):
    if not condition:
        errors.append(message)


slugs = {a["slug"] for a in catalog}
check(50 <= len(catalog) <= 100, f"Expected 50–100 guides, got {len(catalog)}")
check(len(slugs) == len(catalog), "Duplicate slugs")
images = set()
listings = 0
for r in regions:
    check(r["guide"] in slugs, "Missing regional guide " + r["guide"])
    check(
        sum(
            a["region"] == r["id"] and a["kind"] not in ("region", "country")
            for a in catalog
        )
        >= 3,
        "Insufficient coverage " + r["title"],
    )
for e in catalog:
    a = read(ROOT / "content" / (e["slug"] + ".json"))
    listings += len(a["listings"])
    check(a["words"] >= 180, "Short guide " + a["slug"])
    check(bool(a["intro"]), "Missing introduction " + a["slug"])
    check(a["provenance"]["revision"] > 0, "Missing revision " + a["slug"])
    check(a["provenance"]["license"] == "CC BY-SA 4.0", "Missing text license")
    ids = [s["id"] for s in a["sections"]]
    check(len(ids) == len(set(ids)), "Duplicate section IDs " + a["slug"])
    for s in a["sections"]:
        soup = BeautifulSoup(s["html"], "html.parser")
        check(
            not soup.find(["script", "style", "iframe", "img"]),
            "Unsafe or remote asset in " + a["slug"],
        )
        for link in soup.select("a[href]"):
            href = link["href"]
            check(not href.startswith("/wiki/"), "Unresolved source link " + href)
            if href.startswith("/guides/"):
                check(href.split("/")[2] in slugs, "Broken guide link " + href)
            if href.startswith(
                "#"
            ):  # source fragments can refer to removed source widgets
                targets = set(ids) | {
                    x["id"]
                    for section in a["sections"]
                    for x in BeautifulSoup(section["html"], "html.parser").select(
                        "[id]"
                    )
                }
                check(
                    unquote(href[1:]) in targets,
                    "Broken article fragment " + a["slug"] + " " + href,
                )
    p = a["image"]
    if p:
        check(bool(p["artist"] or p["credit"]), "Missing image authorship " + a["slug"])
        check(
            bool(re.match(r"^(CC BY(?:-SA)?(?: |$)|CC0|Public domain)", p["license"])),
            "Unapproved image license " + p["license"],
        )
        check(
            p["source"].startswith("https://commons.wikimedia.org/"),
            "Missing Commons source",
        )
        check(p["licenseUrl"].startswith("https://"), "Missing license URL")
        check(
            (ROOT / "public" / p["file"].lstrip("/")).exists(),
            "Missing image " + p["file"],
        )
        images.add(p["file"])
check(
    {r["slug"] for r in read(ROOT / "public/search-index.json")} == slugs,
    "Search index out of sync",
)
check(
    {r["slug"] for r in read(ROOT / "public/provenance.json")} == slugs,
    "Provenance out of sync",
)
check(
    {r["slug"] for r in read(ROOT / "public/guide-content.json")} == slugs,
    "Downloadable edition out of sync",
)
# Validate static output without an HTTP server, including anchor targets.
out = ROOT / "out"
count = 0
if out.exists():
    docs = {}
    for file in out.rglob("*.html"):
        docs[file] = BeautifulSoup(file.read_text(), "html.parser")
    for file, doc in docs.items():
        for link in doc.select("a[href],img[src],source[src]"):
            href = link.get("href", link.get("src", ""))
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = (
                out / unquote(url.path.lstrip("/"))
                if url.path.startswith("/")
                else file.parent / unquote(url.path)
            )
            if not url.path:
                target = file
            elif target.is_dir():
                target = target / "index.html"
            elif not target.suffix:
                target = target / "index.html"
            check(
                target.exists(),
                f"Export link missing: {file.relative_to(out)} → {href}",
            )
            if url.fragment and target in docs:
                check(
                    docs[target].find(id=unquote(url.fragment)) is not None,
                    f"Export anchor missing: {file.relative_to(out)} → {href}",
                )
            count += 1
print(
    f"{len(catalog)} guides · {sum(e['words'] for e in catalog):,} source words · {listings:,} structured listings · {len(images)} licensed images"
)
print(
    f"{count:,} exported links/assets checked"
    if out.exists()
    else "Static export not yet present; run again after build."
)
for e in errors:
    print("ERROR:", e)
if errors:
    sys.exit(1)
print("Validation passed.")
