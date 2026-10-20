import Link from "next/link";
import { catalog, regions, entry, photoFor, collections } from "@/lib/content";
import { publicAsset } from "@/lib/paths";
import { Card, PhotoCredit, SectionHeading } from "@/components/editorial";
export default function Home() {
  const hero = entry("lisbon") ?? entry("portugal")!;
  const photo = photoFor(hero);
  const picks = ["porto", "sintra", "lagos-portugal", "funchal"]
    .map(entry)
    .filter((a) => !!a);
  const country = entry("portugal")!;
  return (
    <>
      <section className="opening">
        <div className="opening-copy">
          <p className="eyebrow">
            <span className="small-star">✳</span> A place for the curious
            traveller
          </p>
          <h1>
            Go a little
            <br />
            further.
            <br />
            <em>Stay a little longer.</em>
          </h1>
          <p className="opening-note">
            From the Atlantic edge to the streets in between. Find your own way
            through Portugal.
          </p>
          <Link className="solid-link" href="/explore/">
            Explore the atlas <span>↗</span>
          </Link>
        </div>
        <div className="opening-visual">
          <Link className="hero-image" href={`/guides/${hero.slug}/`}>
            {photo ? (
              <img
                src={publicAsset(photo.file)}
                alt="Lisbon, Portugal"
                width="1600"
                height="900"
                fetchPriority="high"
              />
            ) : null}
            <span className="hero-caption">
              <span className="eyebrow">Start somewhere wonderful</span>
              <span className="hero-title">Lisbon, at your own pace.</span>
              <span className="hero-read">Read the city guide ↗</span>
            </span>
          </Link>
          <div className="photo-baseline">
            <span className="eyebrow">38°43′ N · 9°08′ W</span>
            <PhotoCredit photo={photo} />
          </div>
        </div>
      </section>
      <div className="region-ribbon">
        <span className="eyebrow">Seven ways in</span>
        {regions.map((r) => (
          <Link key={r.id} href={`/regions/${r.id}/`}>
            {r.title} <span>↗</span>
          </Link>
        ))}
      </div>
      <section className="editorial-section">
        <SectionHeading
          kicker="The destination edit / 01"
          title="Somewhere that stays with you."
          href="/explore/"
        />
        <div className="card-grid four">
          {picks.map((a, i) => (
            <Card
              key={a.slug}
              article={a}
              number={String(i + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </section>
      <section className="country-note">
        <span className="oversized-star" aria-hidden="true">
          ✳
        </span>
        <div>
          <p className="eyebrow">A small country. A world of its own.</p>
          <h2>
            Between land <em>and sea.</em>
          </h2>
          <p>{country.excerpt}</p>
          <Link className="text-link" href="/guides/portugal/">
            An introduction to Portugal ↗
          </Link>
        </div>
        <div className="atlas-number">
          <span>{catalog.length}</span>
          <p>
            guides to the mainland
            <br />
            and the islands
          </p>
        </div>
      </section>
      <section className="editorial-section">
        <SectionHeading
          kicker="Choose your direction / 02"
          title="There’s more than one Portugal."
          href="/regions/"
          label="Meet the regions"
        />
        <div className="region-grid">
          {regions.map((r, i) => {
            const a = entry(r.guide);
            const p = a ? photoFor(a) : null;
            return (
              <Link
                className={`region-tile region-${i}`}
                key={r.id}
                href={`/regions/${r.id}/`}
              >
                {p ? (
                  <img
                    src={publicAsset(p.file)}
                    alt={r.title}
                    loading="lazy"
                    width="800"
                    height="500"
                  />
                ) : null}
                <div>
                  <span className="eyebrow">0{i + 1} / The regions</span>
                  <h3>{r.title}</h3>
                  <span>Discover the region ↗</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="editorial-section collections">
        <SectionHeading
          kicker="Ways of seeing / 03"
          title="Follow your curiosity."
        />
        {collections.map((c, i) => (
          <Link
            className="collection-row"
            key={c.slug}
            href={`/collections/${c.slug}/`}
          >
            <span className="eyebrow">0{i + 1}</span>
            <h3>{c.title}</h3>
            <p>{c.subtitle}</p>
            <span className="collection-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </section>
      <section className="closing-note">
        <p className="eyebrow">Good journeys start with a little curiosity.</p>
        <h2>
          Where will you
          <br />
          <em>find yourself?</em>
        </h2>
        <Link className="solid-link" href="/explore/">
          Find your next place ↗
        </Link>
      </section>
    </>
  );
}
