import type { Metadata } from "next";
import Link from "next/link";
import { regions, entry, photoFor, catalog } from "@/lib/content";
import { publicAsset } from "@/lib/paths";
import { Breadcrumbs, PhotoCredit } from "@/components/editorial";
export const metadata: Metadata = { title: "The regions" };
export default function Regions() {
  return (
    <>
      <Breadcrumbs items={[{ title: "The regions" }]} />
      <div className="page-intro">
        <p className="eyebrow">A sense of place</p>
        <h1>
          Seven regions.
          <br />
          <em>Countless possibilities.</em>
        </h1>
        <p>
          Follow the country from its northern hills to the Atlantic islands.
          Every region opens a different chapter.
        </p>
      </div>
      <div className="region-index">
        {regions.map((r, i) => {
          const a = entry(r.guide)!;
          const p = photoFor(a);
          return (
            <article key={r.id}>
              <Link className="region-index-photo" href={`/regions/${r.id}/`}>
                {p ? (
                  <img
                    src={publicAsset(p.file)}
                    alt={r.title}
                    width="900"
                    height="500"
                    loading="lazy"
                  />
                ) : null}
              </Link>
              <div>
                <p className="eyebrow">
                  0{i + 1} / {catalog.filter((a) => a.region === r.id).length}{" "}
                  guides
                </p>
                <h2>
                  <Link href={`/regions/${r.id}/`}>{r.title}</Link>
                </h2>
                <p>{a.excerpt}</p>
                <Link className="text-link" href={`/regions/${r.id}/`}>
                  Explore {r.title} ↗
                </Link>
                <PhotoCredit photo={p} />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
