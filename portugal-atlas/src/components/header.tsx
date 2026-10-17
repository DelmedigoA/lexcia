"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="topline">
        <span>An independent atlas of Portugal</span>
        <span>Land, sea & everything between</span>
      </div>
      <div className="masthead">
        <Link href="/" aria-label="Terra and Mar home">
          Terra <span>&</span> Mar<span className="masthead-dot">.</span>
        </Link>
        <span className="masthead-stamp">
          PORTUGAL
          <br />A FIELD GUIDE
        </span>
      </div>
      <div className="nav-row">
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close −" : "Menu +"}
        </button>
        <nav
          id="main-navigation"
          className={open ? "main-nav is-open" : "main-nav"}
          aria-label="Main navigation"
        >
          {[
            ["/", "The journal"],
            ["/regions/", "The regions"],
            ["/explore/", "The atlas"],
            ["/about/", "Our story"],
          ].map(([url, label]) => (
            <Link
              key={url}
              href={url}
              onClick={() => setOpen(false)}
              aria-current={
                path === url || path === url.slice(0, -1) ? "page" : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link className="search-link" href="/explore/#search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8.5"
              cy="8.5"
              r="5.75"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.4" />
          </svg>{" "}
          Find a place
        </Link>
      </div>
    </header>
  );
}
