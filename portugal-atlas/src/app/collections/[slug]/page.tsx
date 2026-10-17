import { notFound } from "next/navigation";
import { collections, entry } from "@/lib/content";
import { Card, Breadcrumbs } from "@/components/editorial";
export const dynamicParams = false;
export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: collections.find((c) => c.slug === slug)?.title ?? "Collection",
  };
}
export default async function Collection({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = collections.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <>
      <Breadcrumbs
        items={[{ title: "The atlas", href: "/explore/" }, { title: c.title }]}
      />
      <div className="page-intro">
        <p className="eyebrow">A Terra & Mar collection</p>
        <h1>
          {c.title}
          <em>.</em>
        </h1>
        <p>{c.description}</p>
      </div>
      <div className="card-grid three collection-cards">
        {c.slugs
          .map(entry)
          .filter((a) => !!a)
          .map((a) => (
            <Card key={a.slug} article={a} />
          ))}
      </div>
    </>
  );
}
