"use client";
import Link from "next/link";
import { useState, useEffect, useDeferredValue, useMemo } from "react";
import type { Entry } from "@/lib/content";
import { basePath, publicAsset } from "@/lib/paths";
type Result = {
  title: string;
  displayTitle: string;
  slug: string;
  region: string;
  kind: string;
  excerpt: string;
  searchText: string;
};
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
export default function Explorer({
  entries,
  regions,
}: {
  entries: Entry[];
  regions: { id: string; title: string }[];
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [kind, setKind] = useState("all");
  const [index, setIndex] = useState<Result[] | null>(null);
  const [error, setError] = useState(false);
  const deferred = useDeferredValue(query);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${basePath}/search-index.json`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("index");
        return r.json();
      })
      .then(setIndex)
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, []);
  const results = useMemo(() => {
    const tokens = normalize(deferred.trim()).split(/\s+/).filter(Boolean);
    const source = index ?? entries.map((e) => ({ ...e, searchText: e.intro }));
    return source
      .filter(
        (a) =>
          (region === "all" || a.region === region) &&
          (kind === "all" || a.kind === kind),
      )
      .map((a) => {
        const title = normalize(a.title);
        const text = normalize(a.searchText);
        return {
          a,
          score: tokens.reduce(
            (n, t) =>
              n + (title.includes(t) ? 10 : 0) + (text.includes(t) ? 1 : 0),
            0,
          ),
          match: tokens.every((t) => title.includes(t) || text.includes(t)),
        };
      })
      .filter((x) => x.match)
      .sort(
        (a, b) =>
          b.score - a.score || a.a.displayTitle.localeCompare(b.a.displayTitle),
      )
      .map((x) => x.a);
  }, [deferred, region, kind, index, entries]);
  return (
    <div className="explorer">
      <div className="explore-controls">
        <div className="search-field">
          <label className="eyebrow" htmlFor="search">
            A place, a region, a passing curiosity
          </label>
          <div>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Lisbon, beaches or a train journey…"
            />
            <span aria-hidden="true">↗</span>
          </div>
        </div>
        <div className="filters">
          <label>
            Region
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="all">All of Portugal</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Guide type
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="all">All guides</option>
              <option value="destination">Destinations</option>
              <option value="region">Regions</option>
              <option value="neighborhood">Neighbourhoods</option>
              <option value="country">Country guide</option>
            </select>
          </label>
          <button
            className="reset-button"
            onClick={() => {
              setQuery("");
              setRegion("all");
              setKind("all");
            }}
          >
            Reset filters ↺
          </button>
        </div>
      </div>
      <div className="results-status" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "guide" : "guides"}
        {query ? ` matching “${query}”` : " to explore"}
        {!index && !error ? " · Loading full-text index…" : ""}
        {error
          ? " · Searching titles and introductions; full-text index could not load."
          : ""}
      </div>
      {results.length ? (
        <div className="search-results">
          {results.map((a) => {
            const e = entries.find((x) => x.slug === a.slug);
            return (
              <article key={a.slug}>
                <div>
                  <p className="eyebrow">
                    {regions.find((r) => r.id === a.region)?.title ??
                      "Portugal"}{" "}
                    / {a.kind}
                  </p>
                  <h2>
                    <Link href={`/guides/${a.slug}/`}>{a.displayTitle}</Link>
                  </h2>
                  <p>{a.excerpt}</p>
                  <Link className="text-link" href={`/guides/${a.slug}/`}>
                    Read the guide ↗
                  </Link>
                </div>
                {e?.image ? (
                  <Link
                    tabIndex={-1}
                    aria-hidden="true"
                    href={`/guides/${a.slug}/`}
                  >
                    <img
                      src={publicAsset(e.image.file)}
                      alt=""
                      width="340"
                      height="200"
                      loading="lazy"
                    />
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>A little off the map.</h2>
          <p>
            No guides match these filters. Try a broader search or another
            region.
          </p>
          <button
            className="solid-link"
            onClick={() => {
              setQuery("");
              setRegion("all");
              setKind("all");
            }}
          >
            See every guide ↗
          </button>
        </div>
      )}
    </div>
  );
}
