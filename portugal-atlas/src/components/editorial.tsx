import Link from "next/link";
import { type Entry, type Photo, photoFor, regionName } from "@/lib/content";
import { publicAsset } from "@/lib/paths";
export function PhotoCredit({ photo }: { photo: Photo | null }) {
  return photo ? (
    <span className="photo-credit">
      Photography: <a href={photo.source}>{photo.artist || photo.title}</a> ·{" "}
      <a href={photo.licenseUrl}>{photo.license}</a>
    </span>
  ) : null;
}
export function Card({ article, number }: { article: Entry; number?: string }) {
  const photo = photoFor(article);
  return (
    <article className="destination-card">
      <Link className="card-photo" href={`/guides/${article.slug}/`}>
        {photo ? (
          <img
            src={publicAsset(photo.file)}
            alt={photo.title.replace(/\.[^.]+$/, "")}
            loading="lazy"
            width="800"
            height="500"
          />
        ) : null}
        <span className="image-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <div className="eyebrow card-kicker">
        {number ? <span>{number} / </span> : null}
        {regionName(article.region)}
      </div>
      <h3>
        <Link href={`/guides/${article.slug}/`}>{article.displayTitle}</Link>
      </h3>
      <p>{article.excerpt}</p>
      <Link className="text-link" href={`/guides/${article.slug}/`}>
        Open the guide <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { title: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((i, n) => (
        <span key={n}>
          <span aria-hidden="true"> / </span>
          {i.href ? (
            <Link href={i.href}>{i.title}</Link>
          ) : (
            <span aria-current="page">{i.title}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function SectionHeading({
  kicker,
  title,
  href,
  label = "Explore all guides",
}: {
  kicker: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {href ? (
        <Link className="text-link" href={href}>
          {label} ↗
        </Link>
      ) : null}
    </div>
  );
}
