import Link from "next/link";
import { notFound } from "next/navigation";
import {
  catalog,
  entry,
  getGuide,
  regions,
  regionName,
  photoFor,
  type Entry,
} from "@/lib/content";
import { basePath, publicAsset } from "@/lib/paths";
import {
  Breadcrumbs,
  PhotoCredit,
  Card,
  SectionHeading,
} from "@/components/editorial";
export const dynamicParams = false;
export function generateStaticParams() {
  return catalog.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = entry(slug);
  return {
    title: a ? `${a.displayTitle} travel guide` : "Guide",
    description: a?.excerpt,
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!entry(slug)) notFound();
  const a = getGuide(slug);
  const r = regions.find((r) => r.id === a.region);
  const photo = photoFor(a);
  const related = [
    ...a.related.map(entry).filter((x): x is Entry => !!x && x.slug !== a.slug),
    ...catalog.filter((x) => x.region === a.region && x.slug !== a.slug),
  ];
  const unique = related
    .filter((x, i) => related.findIndex((y) => y.slug === x.slug) === i)
    .slice(0, 3);
  return (
    <>
      <Breadcrumbs
        items={[
          { title: "The atlas", href: "/explore/" },
          ...(r ? [{ title: r.title, href: `/regions/${r.id}/` }] : []),
          { title: a.displayTitle },
        ]}
      />
      <header className="article-heading">
        <p className="eyebrow">
          {regionName(a.region)} /{" "}
          {a.kind === "neighborhood" ? "Neighbourhood" : "Travel"} guide
        </p>
        <h1>
          {a.displayTitle}
          <em>.</em>
        </h1>
        <p>{a.excerpt}</p>
        <div className="article-meta">
          <span>{Math.ceil(a.words / 230)} min read</span>
          <span>
            Source edition ·{" "}
            {new Date(a.provenance.retrieved).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </span>
        </div>
      </header>
      {photo ? (
        <>
          <div className="wide-photo article-photo">
            <img
              src={publicAsset(photo.file)}
              alt={photo.title.replace(/\.[^.]+$/, "")}
              width="1600"
              height="600"
              fetchPriority="high"
            />
          </div>
          <PhotoCredit photo={photo} />
        </>
      ) : null}
      <div className="article-layout">
        <aside className="article-toc">
          <details open>
            <summary>In this guide</summary>
            <nav aria-label="Guide sections">
              {a.sections
                .filter((s) => s.level === 2)
                .map((s) => (
                  <a key={s.id} href={`#${encodeURIComponent(s.id)}`}>
                    {s.title}
                  </a>
                ))}
            </nav>
          </details>
          <div className="source-note">
            <p>From the open travel commons.</p>
            <a href={a.provenance.permalink}>View source revision ↗</a>
          </div>
        </aside>
        <article className="guide-body">
          {a.sections.map((s, i) => (
            <section key={s.id + "-" + i} id={s.id}>
              {s.id !== "overview" ? (
                s.level === 2 ? (
                  <h2>{s.title}</h2>
                ) : (
                  <h3>{s.title}</h3>
                )
              ) : null}
              <div dangerouslySetInnerHTML={{ __html: s.html.replace(/href="\/(?!\/)/g, `href="${basePath}/`) }} />
            </section>
          ))}
          <div className="article-attribution">
            <p className="eyebrow">Sources & reuse</p>
            <p>
              Adapted from <a href={a.provenance.source}>{a.title}</a> by{" "}
              <a href={a.provenance.history}>Wikivoyage contributors</a>, under{" "}
              <a href={a.provenance.licenseUrl}>CC BY-SA 4.0</a>. This adapted
              guide is available under the same license.
            </p>
            <p>
              {a.provenance.changes} Travel details can change; check with
              operators before making plans.
            </p>
            <Link href="/credits/">Full credits & licensing ↗</Link>
          </div>
        </article>
      </div>
      {unique.length ? (
        <section className="editorial-section">
          <SectionHeading
            kicker="The journey continues"
            title="A little further afield."
          />
          <div className="card-grid three">
            {unique.map((x) => (
              <Card key={x.slug} article={x} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
