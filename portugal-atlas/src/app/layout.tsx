import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/header";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Terra & Mar — An independent atlas of Portugal",
    template: "%s | Terra & Mar",
  },
  description:
    "A Portugal travel atlas. Explore the mainland and islands through detailed, interconnected destination guides.",
  robots: { index: true, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="page-shell">
          <Header />
          <main id="main">{children}</main>
          <footer>
            <div className="footer-top">
              <div>
                <Link className="footer-logo" href="/">
                  Terra & Mar.
                </Link>
                <p>A country worth taking your time with.</p>
              </div>
              <nav aria-label="Footer">
                <Link href="/regions/">The regions</Link>
                <Link href="/explore/">Explore the atlas</Link>
                <Link href="/about/">About the publication</Link>
                <Link href="/credits/">Sources & licenses</Link>
              </nav>
            </div>
            <div className="footer-bottom">
              <span>Portugal, from the mainland to the islands.</span>
              <span>
                A fictional demonstration publication · Text: Wikivoyage
                contributors, CC BY-SA 4.0
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
