import type { Metadata } from "next";
import { catalog, regions } from "@/lib/content";
import Explorer from "@/components/explorer";
import { Breadcrumbs } from "@/components/editorial";
export const metadata: Metadata = {
  title: "Explore the atlas",
  description:
    "Search destination guides across mainland Portugal, Madeira and the Azores.",
};
export default function Explore() {
  return (
    <>
      <Breadcrumbs items={[{ title: "Explore the atlas" }]} />
      <div className="page-intro">
        <p className="eyebrow">The complete atlas / {catalog.length} guides</p>
        <h1>
          Your next chapter
          <br />
          <em>starts here.</em>
        </h1>
        <p>
          Look up a place you know. Find somewhere you don’t. Search the guides
          or let a region lead the way.
        </p>
      </div>
      <Explorer entries={catalog} regions={regions} />
    </>
  );
}
