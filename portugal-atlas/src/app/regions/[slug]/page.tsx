import { notFound } from "next/navigation";
import { catalog, regions, entry, photoFor } from "@/lib/content";
import { publicAsset } from "@/lib/paths";
import {
  Card,
  Breadcrumbs,
  PhotoCredit,
  SectionHeading,
} from "@/components/editorial";
import Link from "next/link";
export const dynamicParams = false;
export function generateStaticParams() {
  return regions.map((r) => ({ slug: r.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: regions.find((r) => r.id === slug)?.title ?? "Region" };
}
export default async function Region({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = regions.find((r) => r.id === slug);
  if (!r) notFound();
  const a = entry(r.guide)!;
  const photo = photoFor(a);
  const guides = catalog.filter(
    (a) => a.region === r.id && a.kind !== "region",
  );
  return (
    <>
      <Breadcrumbs
        items={[
          { title: "The regions", href: "/regions/" },
          { title: r.title },
        ]}
      />
      <div className="page-intro">
        <p className="eyebrow">Portugal / The regions</p>
        <h1>
          {r.title}
          <em>.</em>
        </h1>
        <p>{a.intro.slice(0, 650)}</p>
      </div>
      {photo ? (
        <>
          <div className="wide-photo">
            <img src={publicAsset(photo.file)} alt={r.title} width="1600" height="600" />
          </div>
          <PhotoCredit photo={photo} />
        </>
      ) : null}
      <div className="region-lead">
        <Link className="solid-link" href={`/guides/${a.slug}/`}>
          Read the regional guide ↗
        </Link>
        <p>
          The full guide includes source information on getting here, getting
          around and places to explore.
        </p>
      </div>
      <section className="editorial-section">
        <SectionHeading
          kicker={`${guides.length} places to begin`}
          title="Inside the region."
        />
        <div className="card-grid three">
          {guides.map((a) => (
            <Card key={a.slug} article={a} />
          ))}
        </div>
      </section>
      <div className="next-region">
        <p className="eyebrow">Keep travelling</p>
        {regions
          .filter((x) => x.id !== r.id)
          .map((x) => (
            <Link key={x.id} href={`/regions/${x.id}/`}>
              {x.title} ↗
            </Link>
          ))}
      </div>
    </>
  );
}
