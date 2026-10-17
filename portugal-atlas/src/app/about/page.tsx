import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/editorial";
export const metadata: Metadata = { title: "Our story" };
export default function About() {
  return (
    <>
      <Breadcrumbs items={[{ title: "Our story" }]} />
      <div className="page-intro">
        <p className="eyebrow">Land, sea & everything between</p>
        <h1>
          A country to explore.
          <br />
          <em>A place to begin.</em>
        </h1>
      </div>
      <div className="about-layout">
        <span className="about-symbol" aria-hidden="true">
          ✳
        </span>
        <div className="prose">
          <h2>Welcome to Terra & Mar.</h2>
          <p>
            Terra means land. Mar means sea. Together, they frame our atlas of
            Portugal: a place to find a city guide, follow a regional thread or
            spend a little time imagining your next journey.
          </p>
          <p>
            We bring the depth of an open travel guide into a quieter editorial
            setting. The atlas connects the mainland, Madeira and the Azores
            through regional chapters, destination guides and curated reading
            collections.
          </p>
          <h2>An open foundation.</h2>
          <p>
            The guide text comes from English Wikivoyage, a travel resource
            written and maintained by volunteer contributors. Their work is
            credited on every guide, with a link to the exact source revision
            and its history. Photographs are individually licensed works from
            Wikimedia Commons. We have reorganized and restyled this material;
            we do not claim to have reported these guides ourselves.
          </p>
          <p>
            Travel information is a snapshot of the source at import time.
            Transport, prices, opening hours and entry requirements may change.
            Check current details with the relevant operator or official source
            before travelling.
          </p>
          <h2>A note on this publication.</h2>
          <p>
            <strong>Terra & Mar is a fictional demonstration website.</strong>{" "}
            It is not a real travel publisher, a booking service, an official
            tourism organization or a project of Wikimedia. Its visual identity
            and editorial framing were created for this demonstration. The
            destination information is sourced travel content, not fictional
            reporting.
          </p>
          <Link className="text-link" href="/credits/">
            Read our sources & licensing notes ↗
          </Link>
        </div>
      </div>
    </>
  );
}
