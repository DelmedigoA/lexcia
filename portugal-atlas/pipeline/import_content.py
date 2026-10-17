#!/usr/bin/env python3
"""Import an offline, attributed edition from official Wikimedia APIs.
Serial, cached requests; maxlag; exponential retry; never invent missing content.
"""

import argparse, hashlib, io, json, re, time, unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, unquote
import bleach
import requests
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "pipeline/cache"
CACHE.mkdir(parents=True, exist_ok=True)
CONTENT = ROOT / "content"
CONTENT.mkdir(exist_ok=True)
UA = "TerraMarTravelAtlas/1.0 (offline Portugal travel publication; https://github.com/DelmedigoA) python-requests"
SESSION = requests.Session()
SESSION.headers["User-Agent"] = UA
REGIONS = [
    ("Northern Portugal", "north", "Northern Portugal"),
    ("Beiras", "central", "Central Portugal"),
    ("Tagus Valley", "lisbon-region", "Lisbon & the Tagus"),
    ("Alentejo", "alentejo", "Alentejo"),
    ("Algarve", "algarve", "Algarve"),
    ("Madeira", "madeira", "Madeira"),
    ("Azores", "azores", "Azores"),
]
PRIORITIES = [
    "Lisbon",
    "Porto",
    "Sintra",
    "Cascais",
    "Braga",
    "Guimarães",
    "Coimbra",
    "Aveiro",
    "Nazaré",
    "Óbidos",
    "Évora",
    "Beja",
    "Faro",
    "Lagos",
    "Tavira",
    "Albufeira",
    "Funchal",
    "Ponta Delgada",
    "Angra do Heroísmo",
    "Pico",
    "São Miguel",
    "Terceira",
    "Porto Santo",
    "Sagres",
    "Vila Nova de Milfontes",
    "Douro Litoral",
    "Trás-os-Montes e Alto Douro",
]
BLOCKS = ["h2", "h3", "h4", "p", "ul", "ol", "dl", "table", "blockquote"]
OMIT = ".mw-editsection, .noprint, .metadata, .hatnote, .sistersitebox, .sister-project, .mw-kartographer-map, .mw-kartographer-maplink, .listing-coordinates, .geo, .mw-empty-elt, style, script, figure, .thumb, .mw-indicators, .nomobile, .mapframe, .navigation-not-searchable"


def slug(s):
    return re.sub(
        r"[^a-z0-9]+",
        "-",
        unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower(),
    ).strip("-")


def get(url, params=None, binary=False):
    key = hashlib.sha256(
        (url + json.dumps(params, sort_keys=True)).encode()
    ).hexdigest()
    path = CACHE / (key + (".bin" if binary else ".json"))
    if path.exists():
        return path.read_bytes() if binary else json.loads(path.read_text())
    for attempt in range(5):
        time.sleep(0.65 * (attempt + 1))
        try:
            r = SESSION.get(url, params=params, timeout=60)
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(min(int(r.headers.get("Retry-After", "5")), 60))
                continue
            r.raise_for_status()
            value = r.content if binary else r.json()
            if not binary and "error" in value:
                if value["error"]["code"] in ("maxlag", "ratelimited"):
                    time.sleep(5 * (attempt + 1))
                    continue
                raise ValueError(value["error"])
            path.write_bytes(
                value if binary else json.dumps(value, ensure_ascii=False).encode()
            )
            return value
        except (requests.RequestException, ValueError):
            if attempt == 4:
                raise
            time.sleep(2**attempt)
    raise RuntimeError("Retry budget exhausted: " + url)


def parse(title):
    return get(
        "https://en.wikivoyage.org/w/api.php",
        {
            "action": "parse",
            "page": title,
            "prop": "text|images|revid",
            "format": "json",
            "formatversion": 2,
            "maxlag": 5,
        },
    )["parse"]


def discover(parsed):
    soup = BeautifulSoup(parsed["text"], "html.parser")
    active = False
    found = []
    for el in soup.find_all(["h2", "h3", "a"]):
        if el.name in ("h2", "h3"):
            geographic = bool(
                re.match(
                    r"^(Regions|Cities|Towns|Villages|Islands|Districts|Other destinations|Destinations|Municipalities)\b",
                    el.get_text(" ", strip=True),
                )
            )
            active = geographic if el.name == "h2" else active or geographic
        elif active and el.get("href", "").startswith("/wiki/"):
            title = unquote(el["href"].split("/wiki/")[1].split("#")[0]).replace(
                "_", " "
            )
            if ":" not in title and title and title not in found:
                found.append(title)
    return found


# All seven regions are explicitly linked in Portugal's Regions section.
# Island hierarchy can point to Atlantic Ocean rather than political geography.
GEO_CACHE = {"Portugal": True, **{t: True for t, _, _ in REGIONS}}
PARENTS = {}


def portuguese(title, seen=None):
    if title in GEO_CACHE:
        return GEO_CACHE[title]
    seen = (seen or set()) | {title}
    if len(seen) > 12:
        return False
    try:
        p = get(
            "https://en.wikivoyage.org/w/api.php",
            {
                "action": "parse",
                "page": title,
                "prop": "wikitext",
                "format": "json",
                "formatversion": 2,
                "maxlag": 5,
            },
        )["parse"]
        match = re.search(r"\{\{\s*ispartof\s*\|\s*([^|}]+)", p["wikitext"], re.I)
        parent = match.group(1).strip().replace("_", " ") if match else None
        PARENTS[title] = parent
        valid = bool(parent and parent not in seen and portuguese(parent, seen))
        GEO_CACHE[title] = valid
        return valid
    except Exception:
        return False


# Selected Commons photograph with proportions suited to the lead layout.
PHOTO_OVERRIDES = {"Lisbon": "Lisbon panorama from the Bairro Alto.jpg"}


def image(parsed):
    names = parsed.get("images", [])
    candidates = [
        n
        for n in names
        if "banner" in n.lower() and n.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    candidates += [
        n
        for n in names
        if n.lower().endswith((".jpg", ".jpeg")) and n not in candidates
    ][:4]
    if parsed.get("title") in PHOTO_OVERRIDES:
        candidates.insert(0, PHOTO_OVERRIDES[parsed["title"]])
    for name in candidates:
        try:
            res = get(
                "https://commons.wikimedia.org/w/api.php",
                {
                    "action": "query",
                    "titles": "File:" + name.replace("_", " "),
                    "prop": "imageinfo",
                    "iiprop": "url|extmetadata",
                    "iiurlwidth": 1600,
                    "format": "json",
                    "formatversion": 2,
                    "maxlag": 5,
                },
            )
            page = res["query"]["pages"][0]
            if "imageinfo" not in page:
                continue
            info = page["imageinfo"][0]
            meta = info["extmetadata"]
            clean = lambda key: BeautifulSoup(
                "<span>" + meta.get(key, {}).get("value", "") + "</span>", "html.parser"
            ).get_text(" ", strip=True)
            license = clean("LicenseShortName")
            license_url = clean("LicenseUrl").replace(
                "http://creativecommons.org/", "https://creativecommons.org/"
            )
            if not re.match(r"^(CC BY(?:-SA)?(?: |$)|CC0|Public domain)", license):
                continue
            if not license_url and license == "Public domain":
                license_url = "https://commons.wikimedia.org/wiki/Commons:Copyright_tags#Public_domain"
            if not license_url:
                continue
            file = (
                slug(name.rsplit(".", 1)[0])
                or "photo-" + hashlib.sha256(name.encode()).hexdigest()[:12]
            ) + ".webp"
            target = ROOT / "public/images" / file
            if not target.exists():
                raw = get(info.get("thumburl", info["url"]), binary=True)
                im = Image.open(io.BytesIO(raw)).convert("RGB")
                im.thumbnail((1600, 1600))
                im.save(target, "WEBP", quality=83)
            return {
                "file": "/images/" + file,
                "title": name.replace("_", " "),
                "artist": clean("Artist"),
                "credit": clean("Credit"),
                "license": license,
                "licenseUrl": license_url,
                "source": info["descriptionurl"],
                "original": info["url"],
                "changes": "Resized and converted to WebP; displayed with layout cropping.",
            }
        except Exception as e:
            print("Image skipped:", name, str(e)[:100], flush=True)
    return None


def normalize(parsed, region, kind, parent):
    soup = BeautifulSoup(parsed["text"], "html.parser")
    for el in soup.select(OMIT):
        el.decompose()
    for el in soup.select("img, .mw-file-description, .mw-file-element"):
        el.decompose()
    for a in soup.select("a"):
        href = a.get("href", "")
        if href.startswith("//"):
            a["href"] = "https:" + href
        elif href.startswith("/w/"):
            a["href"] = "https://en.wikivoyage.org" + href
        elif href.startswith("/wiki/") and any(
            x in href
            for x in ("Special:", "File:", "Wikivoyage:", "Help:", "Category:")
        ):
            a.unwrap()
    sections = [{"id": "overview", "title": "Overview", "level": 2, "html": ""}]
    for block in soup.find_all(BLOCKS):
        if any(p.name in BLOCKS for p in block.parents):
            continue
        if block.name.startswith("h"):
            title = block.get_text(" ", strip=True)
            sections.append(
                {
                    "id": block.get("id")
                    or (block.find(id=True) or {}).get("id")
                    or title.replace(" ", "_"),
                    "title": title,
                    "level": int(block.name[1]),
                    "html": "",
                }
            )
        else:
            html = bleach.clean(
                str(block),
                tags=BLOCKS
                + [
                    "li",
                    "dt",
                    "dd",
                    "a",
                    "b",
                    "strong",
                    "i",
                    "em",
                    "span",
                    "br",
                    "bdi",
                    "abbr",
                    "sup",
                    "sub",
                    "thead",
                    "tbody",
                    "tr",
                    "td",
                    "th",
                    "caption",
                ],
                attributes={"a": ["href", "title"], "*": ["id"]},
                protocols=["https", "http", "mailto", "tel"],
                strip=True,
            )
            if BeautifulSoup(html, "html.parser").get_text(" ", strip=True):
                sections[-1]["html"] += html
    sections = [
        s
        for s in sections
        if s["id"] != "overview"
        or BeautifulSoup(s["html"], "html.parser").get_text(" ", strip=True)
    ]
    overview = next((s["html"] for s in sections if s["id"] == "overview"), "")
    ps = BeautifulSoup(overview, "html.parser").find_all("p")
    intro = " ".join(p.get_text(" ", strip=True) for p in ps[:2])
    intro = re.sub(r"\s+([,.;:!?])", r"\1", intro).replace(" 's", "'s")
    text = " ".join(
        BeautifulSoup(s["html"], "html.parser").get_text(" ", strip=True)
        for s in sections
    )
    listings = []
    # Record fields independently from the presentation HTML.
    raw = BeautifulSoup(parsed["text"], "html.parser")
    for v in raw.select(".vcard"):
        name = v.select_one(".listing-name")
        if not name:
            continue
        item = {"name": name.get_text(" ", strip=True)}
        for key, selector in [
            ("address", ".listing-address"),
            ("phone", ".listing-phone"),
            ("hours", ".listing-hours"),
            ("price", ".listing-price"),
            ("description", ".listing-content"),
        ]:
            el = v.select_one(selector)
            if el:
                item[key] = el.get_text(" ", strip=True)
        listings.append(item)
    title = parsed["title"]
    rev = parsed["revid"]
    return {
        "title": title,
        "slug": slug(title),
        "displayTitle": re.sub(
            r" \((?:Portugal|Madeira|Azores)\)$", "", title.replace("Lisbon/", "")
        ),
        "region": region,
        "kind": kind,
        "parent": parent,
        "intro": intro,
        "sections": sections,
        "listings": listings,
        "words": len(text.split()),
        "searchText": text,
        "related": [],
        "image": None,
        "provenance": {
            "source": "https://en.wikivoyage.org/wiki/"
            + quote(title.replace(" ", "_")),
            "revision": rev,
            "permalink": f"https://en.wikivoyage.org/w/index.php?oldid={rev}",
            "history": "https://en.wikivoyage.org/w/index.php?title="
            + quote(title.replace(" ", "_"))
            + "&action=history",
            "retrieved": datetime.now(timezone.utc).isoformat(),
            "attribution": "Wikivoyage contributors",
            "license": "CC BY-SA 4.0",
            "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
            "changes": "Navigation and presentation reformatted; non-content widgets and inline imagery removed; internal links localized. Text retained from source.",
        },
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=78)
    args = ap.parse_args()
    allpages = {}
    aliases = {}
    discovered = {}
    failures = []

    def add(title, region, kind="destination", parent="portugal"):
        if title in allpages or title in aliases:
            return
        try:
            if not portuguese(title):
                print("Outside Portugal hierarchy:", title, flush=True)
                return
            p = parse(title)
            canonical = p["title"]
            aliases[title] = slug(canonical)
            if canonical in allpages:
                return
            record = normalize(p, region, kind, parent)
            record["sourceParent"] = PARENTS.get(title)
            if record["words"] < 180:
                print("Too short:", title, flush=True)
                return
            record["image"] = image(p)
            allpages[canonical] = record
            discovered[canonical] = discover(p)
            print(
                len(allpages),
                canonical,
                record["words"],
                "words",
                bool(record["image"]),
                flush=True,
            )
        except Exception as e:
            failures.append({"title": title, "error": str(e)})
            print("Skipped", title, str(e)[:180], flush=True)

    add("Portugal", "portugal", "country", None)
    root_links = discovered.get("Portugal", [])
    for title, rid, label in REGIONS:
        if title not in root_links:
            raise ValueError("Region not discovered from Portugal: " + title)
        add(title, rid, "region")
    queues = {rid: list(discovered.get(title, [])) for title, rid, _ in REGIONS}
    # Round-robin geographic discovery: links only from geographic sections, not general travel links.
    for rid, q in queues.items():
        q.sort(
            key=lambda t: (
                t not in PRIORITIES,
                PRIORITIES.index(t) if t in PRIORITIES else 999,
            )
        )
    attempted = set(allpages)
    while len(allpages) < args.limit and any(queues.values()):
        for title, rid, _ in REGIONS:
            q = queues[rid]
            while q and q[0] in attempted:
                q.pop(0)
            if not q:
                continue
            candidate = q.pop(0)
            attempted.add(candidate)
            add(candidate, rid, parent=slug(title))
            if candidate in discovered:
                for child in discovered[candidate]:
                    if (
                        child not in attempted
                        and child not in q
                        and child != "Portugal"
                    ):
                        q.append(child)
            if len(allpages) >= args.limit:
                break
    # Lisbon's district guides are linked from its actual district section.
    lisbon = discovered.get("Lisbon", [])
    for t in lisbon:
        if t.startswith("Lisbon/") and t not in allpages:
            add(t, "lisbon-region", "neighborhood", "lisbon")
    mapping = {t: r["slug"] for t, r in allpages.items()}
    mapping.update(aliases)
    valid = {r["slug"] for r in allpages.values()}
    for r in allpages.values():
        related = []
        targets = {s["id"] for s in r["sections"]} | {
            x["id"]
            for section in r["sections"]
            for x in BeautifulSoup(section["html"], "html.parser").select("[id]")
        }
        for s in r["sections"]:
            doc = BeautifulSoup(s["html"], "html.parser")
            for a in doc.select("a[href]"):
                href = a["href"]
                if href.startswith("#") and unquote(href[1:]) not in targets:
                    replacement = next(
                        (t for t in targets if slug(t) == slug(unquote(href[1:]))), None
                    )
                    if replacement:
                        a["href"] = "#" + quote(replacement)
                    else:
                        a.unwrap()
                        continue
                if href.startswith("/wiki/"):
                    parts = href[6:].split("#", 1)
                    t = unquote(parts[0]).replace("_", " ")
                    dest = mapping.get(t)
                    if dest in valid:
                        a["href"] = (
                            "/guides/" + dest + "/"
                        )  # heading fragments vary between revisions, use stable article route
                        if dest != r["slug"] and dest not in related:
                            related.append(dest)
                    else:
                        a["href"] = "https://en.wikivoyage.org" + href
                        a["title"] = "Read on Wikivoyage (external source)"
            s["html"] = str(doc)
        r["related"] = related
        if not r["intro"]:
            r["intro"] = r["searchText"][:500]
        r["excerpt"] = (
            r["intro"][:250].rsplit(" ", 1)[0] + "…"
            if len(r["intro"]) > 250
            else r["intro"]
        )
        (CONTENT / (r["slug"] + ".json")).write_text(
            json.dumps(r, ensure_ascii=False, indent=2) + "\n"
        )
    records = list(allpages.values())
    for old in CONTENT.glob("*.json"):
        if old.stem not in valid and old.name not in (
            "catalog.json",
            "regions.json",
            "import-report.json",
        ):
            old.unlink()
    catalog = [
        {
            k: r[k]
            for k in [
                "title",
                "displayTitle",
                "slug",
                "region",
                "kind",
                "intro",
                "excerpt",
                "words",
                "image",
                "related",
            ]
        }
        for r in records
    ]
    (CONTENT / "catalog.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n"
    )
    (CONTENT / "regions.json").write_text(
        json.dumps(
            [
                {"title": label, "sourceTitle": t, "id": rid, "guide": slug(t)}
                for t, rid, label in REGIONS
            ],
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    (ROOT / "public/search-index.json").write_text(
        json.dumps(
            [
                {
                    k: r[k]
                    for k in [
                        "title",
                        "displayTitle",
                        "slug",
                        "region",
                        "kind",
                        "excerpt",
                        "searchText",
                    ]
                }
                for r in records
            ],
            ensure_ascii=False,
        )
        + "\n"
    )
    (ROOT / "public/provenance.json").write_text(
        json.dumps(
            [
                {
                    "title": r["title"],
                    "slug": r["slug"],
                    "text": r["provenance"],
                    "image": r["image"],
                }
                for r in records
            ],
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    (CONTENT / "import-report.json").write_text(
        json.dumps(
            {
                "articles": len(records),
                "words": sum(r["words"] for r in records),
                "images": sum(bool(r["image"]) for r in records),
                "failures": failures,
                "discovery": discovered,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    used_images = {r["image"]["file"] for r in records if r["image"]}
    for old in (ROOT / "public/images").glob("*"):
        if "/images/" + old.name not in used_images:
            old.unlink()
    # Reusable adaptations are downloadable separately from software.
    (ROOT / "public/guide-content.json").write_text(
        json.dumps(records, ensure_ascii=False) + "\n"
    )
    print("Finished:", len(records), "guides", flush=True)


if __name__ == "__main__":
    main()
