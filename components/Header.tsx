'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme';

const NAV_LINKS = [
  { href: '/#sources', label: 'Sources' },
  { href: '/#disciplines', label: 'Disciplines' },
  { href: '/saved', label: 'Library' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/saved') return pathname.startsWith('/saved');
  return false;
}

export default function Header() {
  const pathname = usePathname();
  const { theme, toggle, mounted } = useTheme();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isOpen = openPath === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPath(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      <header className="nav">
        <div className="wrap nav__bar">
          <a className="skip" href="#main">
            Skip to content
          </a>

          <nav className="nav__links" aria-label="Main">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="nav__link"
                aria-current={isActive(pathname, link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link className="nav__logo" href="/" aria-label="ResearchArchive home">
            <span className="mark" aria-hidden="true">
              R
            </span>
            ResearchArchive
          </Link>

          <div className="nav__actions">
            <button
              type="button"
              onClick={toggle}
              className="icon-btn"
              aria-label={
                mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` : 'Switch theme'
              }
            >
              {mounted && theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              )}
            </button>

            <Link className="btn btn--primary nav__cta" href="/search">
              Search papers
            </Link>

            <button
              type="button"
              className="nav__toggle"
              onClick={() => setOpenPath(isOpen ? null : pathname)}
              aria-expanded={isOpen}
              aria-controls="nav-sheet"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                {isOpen ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M2 5h14M2 13h14" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div id="nav-sheet" className={`nav__sheet${isOpen ? ' is-open' : ''}`}>
        <div className="wrap">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpenPath(null)}>
              {link.label}
            </Link>
          ))}
          <Link className="btn btn--primary" href="/search" onClick={() => setOpenPath(null)} style={{ width: '100%', marginTop: 24 }}>
            Search papers
          </Link>
        </div>
      </div>
    </>
  );
}
