import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-intro">
      <p className="eyebrow">404 / Off the map</p>
      <h1>
        A different
        <br />
        <em>direction?</em>
      </h1>
      <p>
        We couldn’t find that page. There are plenty of other places to begin.
      </p>
      <Link className="solid-link" href="/explore/">
        Explore the atlas ↗
      </Link>
    </div>
  );
}
