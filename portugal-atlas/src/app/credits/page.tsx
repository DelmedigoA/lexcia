import type { Metadata } from "next";
import Link from "next/link";
import { catalog, getGuide } from "@/lib/content";
import { Breadcrumbs } from "@/components/editorial";
export const metadata: Metadata = { title: "Sources & licenses" };
export default function Credits() {
  return (
    <>
      <Breadcrumbs items={[{ title: "Sources & licenses" }]} />
      <div className="page-intro">
        <p className="eyebrow">Made possible by the commons</p>
        <h1>
          Shared knowledge.
          <br />
          <em>Properly credited.</em>
        </h1>
      </div>
      <div className="prose licensing-intro">
        <h2>Travel guide text</h2>
        <p>
          Destination and regional text is adapted from English Wikivoyage by
          Wikivoyage contributors under{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">
            Creative Commons Attribution–ShareAlike 4.0
          </a>
          . Our adaptations are distributed under the same license. Source
          revision and author-history links appear below and on each guide. We
          removed source-site interface elements and inline images, restyled
          sections, and localized links. These changes do not imply contributor
          endorsement.
        </p>
        <p>
          To reuse the adapted text, credit Wikivoyage contributors and Terra &
          Mar, link to the source and the license, indicate changes, and share
          adaptations under the same license. Download the{" "}
          <a href="/guide-content.json">adapted guide content</a> and{" "}
          <a href="/provenance.json">
            machine-readable source and image credits
          </a>
          .
        </p>
        <h2>Photography, typography & software</h2>
        <p>
          Photographs have their own licenses, recorded individually below.
          Images were resized, converted to WebP and may be cropped in the
          layout. Attribution text is supplied from Commons; author links and
          additional details are available on each image source page.
        </p>
        <p>
          Cormorant Garamond and DM Sans are distributed under the SIL Open Font
          License; see the{" "}
          <a href="/fonts/cormorant-OFL.txt">Cormorant license</a> and{" "}
          <a href="/fonts/dm-sans-OFL.txt">DM Sans license</a>. Original website
          software is separately licensed under MIT. The fictional publication
          is independent of Wikivoyage, Wikimedia and official tourism
          organizations.
        </p>
      </div>
      <section className="credits-list">
        <h2>Guide & image credits</h2>
        {catalog.map((e) => {
          const a = getGuide(e.slug);
          const p = a.image;
          return (
            <article key={a.slug}>
              <h3>
                <Link href={`/guides/${a.slug}/`}>{a.title}</Link>
              </h3>
              <p>
                Text: <a href={a.provenance.history}>Wikivoyage contributors</a>{" "}
                ·{" "}
                <a href={a.provenance.permalink}>
                  Revision {a.provenance.permalink.split("=").pop()}
                </a>{" "}
                · <a href={a.provenance.licenseUrl}>CC BY-SA 4.0</a> · Imported{" "}
                {a.provenance.retrieved.slice(0, 10)}
              </p>
              {p ? (
                <p>
                  Photo: <a href={p.source}>{p.title}</a> · {p.artist} ·{" "}
                  <a href={p.licenseUrl}>{p.license}</a>
                  {p.credit ? ` · ${p.credit}` : ""}
                </p>
              ) : (
                <p>
                  No destination-specific photograph; regional photography,
                  where shown, is credited under the regional guide.
                </p>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
