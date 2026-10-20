import fs from "node:fs";
import path from "node:path";
import rawCatalog from "../../content/catalog.json";
import rawRegions from "../../content/regions.json";
export type Photo = {
  file: string;
  title: string;
  artist: string;
  credit: string;
  license: string;
  licenseUrl: string;
  source: string;
  changes: string;
};
export type Entry = {
  title: string;
  displayTitle: string;
  slug: string;
  region: string;
  kind: string;
  intro: string;
  excerpt: string;
  words: number;
  image: Photo | null;
  related: string[];
};
export type Guide = Entry & {
  sections: { id: string; title: string; level: number; html: string }[];
  listings: { name: string; description?: string }[];
  provenance: {
    source: string;
    permalink: string;
    history: string;
    retrieved: string;
    attribution: string;
    licenseUrl: string;
    license: string;
    changes: string;
  };
};
export const catalog = rawCatalog as Entry[];
export const regions = rawRegions;
export const getGuide = (slug: string): Guide =>
  JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "content", slug + ".json"),
      "utf8",
    ),
  );
export const entry = (slug: string) => catalog.find((a) => a.slug === slug);
export const regionName = (id: string) =>
  regions.find((r) => r.id === id)?.title ?? "Portugal";
export const photoFor = (a: Entry): Photo | null => {
  const photo =
    a.image ??
    catalog.find((r) => r.kind === "region" && r.region === a.region && r.image)
      ?.image ??
    entry("portugal")?.image ??
    null;
  return photo;
};
export const collections = [
  {
    slug: "city-notebook",
    title: "The city notebook",
    subtitle: "Streets to wander. Places to linger.",
    description:
      "Explore Portugal through its cities, from the capital to the islands.",
    slugs: [
      "lisbon",
      "porto",
      "coimbra",
      "braga",
      "evora",
      "funchal",
      "ponta-delgada",
      "guimaraes",
    ],
  },
  {
    slug: "atlantic-days",
    title: "Atlantic days",
    subtitle: "Follow the edge of the country.",
    description:
      "A collection of coastal destinations and island guides, drawn from our atlas.",
    slugs: [
      "algarve",
      "lagos-portugal",
      "tavira",
      "cascais",
      "nazare",
      "sagres",
      "madeira",
      "azores",
      "porto-santo",
    ],
  },
  {
    slug: "beyond-the-capital",
    title: "Beyond the capital",
    subtitle: "Let the journey unfold.",
    description:
      "Regional guides and smaller destinations for exploring further afield.",
    slugs: [
      "alentejo",
      "beiras",
      "sintra",
      "obidos",
      "beja",
      "guimaraes",
      "northern-portugal",
      "tras-os-montes-e-alto-douro",
    ],
  },
];
