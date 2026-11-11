'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SOURCE_LINKS = [
  { label: 'arXiv', href: 'https://arxiv.org' },
  { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov' },
  { label: 'CrossRef', href: 'https://www.crossref.org' },
  { label: 'OpenAlex', href: 'https://openalex.org' },
];

const PRODUCT_LINKS = [
  { label: 'Search papers', href: '/search' },
  { label: 'Your library', href: '/saved' },
  { label: 'Source status', href: '/api/health' },
];

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const isHome = pathname === '/';

  if (!isHome) {
    return (
      <footer className="footer footer--compact">
        <div className="wrap footer__bar">
          <Link href="/" className="nav__logo" aria-label="ResearchArchive home">
            <span className="mark" aria-hidden="true">
              R
            </span>
            ResearchArchive
          </Link>
          <div className="footer__cols">
            <div className="footer__col">
              <ul>
                {SOURCE_LINKS.map(item => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="footer__legal footer__legal--row">
            <span>&copy; {year} ResearchArchive</span>
            <span>Data via four open scholarly catalogs.</span>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer closing" aria-labelledby="close-h">
      <div className="wrap">
        <div className="closing__cta">
          <div>
            <h2 id="close-h" className="t-h2">
              Start with a search
            </h2>
            <p>
              Type a topic, an author or a DOI. Four catalogs answer at once and you get one list
              back.
            </p>
          </div>
          <Link className="btn btn--primary" href="/search">
            Search papers
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 6h8" />
              <path d="M4.5 2.5 8 6l-3.5 3.5" />
            </svg>
          </Link>
        </div>

        <div className="closing__links">
          <div className="closing__cols">
            <div className="closing__brand">
              <Link href="/" className="nav__logo" aria-label="ResearchArchive home">
                <span className="mark" aria-hidden="true">
                  R
                </span>
                ResearchArchive
              </Link>
              <p>
                Academic search across 260M papers. Free, no account, and your library stays in this
                browser.
              </p>
            </div>

            <div className="footer__cols">
              <div className="footer__col">
                <h3>Archive</h3>
                <ul>
                  {PRODUCT_LINKS.map(item => (
                    <li key={item.label}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="footer__col">
                <h3>Sources</h3>
                <ul>
                  {SOURCE_LINKS.map(item => (
                    <li key={item.label}>
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="footer__legal">
            <span>&copy; {year} ResearchArchive</span>
            <span>MIT licensed. No accounts, no tracking.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
