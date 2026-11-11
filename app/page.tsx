import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import DiscoveryPreview from '@/components/DiscoveryPreview';
import Citation from '@/components/Citation';
import type { Paper } from '@/lib/types';
import sourcesConfig from '@/data/sources-config.json';
import disciplines from '@/data/disciplines.json';

const SOURCE_ORDER = ['arxiv', 'pubmed', 'crossref', 'openalex'] as const;

const SOURCE_COLOR: Record<string, string> = {
  arxiv: '#b31b1b',
  pubmed: '#326898',
  crossref: '#ef8b2c',
  openalex: '#2563eb',
};

// Real records, checked against OpenAlex on 2026-11-11: title, authors, year and citation
// count are the catalog's own, so the window shows the product rather than a mock.
const DEMO = [
  {
    source: 'arXiv',
    year: '2012',
    cites: '3.4K',
    title: 'Surface codes: Towards practical large-scale quantum computation',
    authors: 'Fowler, Mariantoni, Martinis, Cleland',
    held: ['arxiv', 'crossref', 'openalex'],
  },
  {
    source: 'PubMed',
    year: '2024',
    cites: '1.3K',
    title: 'Quantum error correction below the surface code threshold',
    authors: 'Google Quantum AI and Collaborators',
    held: ['pubmed', 'crossref', 'openalex'],
  },
  {
    source: 'CrossRef',
    year: '2002',
    cites: '2.3K',
    title: 'Topological quantum memory',
    authors: 'Dennis, Kitaev, Landahl, Preskill',
    held: ['crossref', 'openalex'],
  },
];

const EXAMPLE_PAPER: Paper = {
  id: 'doi:10.1038/s41586-024-08449-y',
  title: 'Quantum error correction below the surface code threshold',
  authors: [{ name: 'Google Quantum AI and Collaborators' }],
  abstract: '', date: '2024-12-09', source: 'openalex',
  externalIds: { doi: '10.1038/s41586-024-08449-y' },
  citations: 1300, accessType: 'open',
  url: 'https://doi.org/10.1038/s41586-024-08449-y', journal: 'Nature',
};

export default function HomePage() {
  return (
    <>
      {/* 1 — the promise, and the product on the first screen */}
      <section className="hero hero--discover" aria-labelledby="hero-h">
        <div className="wrap">
          <div className="hero-text grid hero__grid">
            <div className="hero__text span-6">
              <h1 id="hero-h" className="t-h1">
                Find your next paper
              </h1>

              <p className="hero__lead">
                Search four scholarly catalogs. Save the papers worth coming back to. No account needed.
              </p>

              <div className="hero__search">
                <SearchBar size="lg" submitLabel="Search papers" placeholder="Topic, author or DOI" />
              </div>
              <div className="hero__topics" aria-label="Try a topic">
                <span>Explore</span>{['Artificial intelligence', 'Climate', 'Medicine'].map(topic => <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`}>{topic} ↗</Link>)}
              </div>
            </div>

            <div className="hero__media span-6 start-7"><DiscoveryPreview /></div>
          </div>
        </div>
      </section>

      {/* 2 — where the list comes from */}
      <section
        className="section ground-surface"
        id="sources"
        aria-labelledby="sources-h"
        style={{ ['--h' as string]: 1 }}
      >
        <div className="wrap">
          <div className="section-head">
            <h2 id="sources-h" className="t-h2">
              One search, four catalogs.
            </h2>
            <p>
              Each catalog answers in its own order and repeats what the others hold. Results are
              merged on DOI and normalized title, then ranked once.
            </p>
          </div>

          <div className="lanes" data-ui data-visual>
            <div className="lanes__sources">
              {SOURCE_ORDER.map(id => {
                const s = sourcesConfig.sources[id];
                return (
                  <div className="src" key={id}>
                    <span className="src__dot" style={{ background: s.color }} aria-hidden="true" />
                    <span className="src__name">{s.name}</span>
                    <span className="src__count">{s.paperCount}</span>
                    <span className="src__covers">{s.coverage.slice(0, 3).join(' · ')}</span>
                  </div>
                );
              })}
            </div>

            <div className="lanes__spine" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>

            <div className="lanes__out">
              <div className="lanes__out-head">
                <span className="t-label">Merged results</span>
                <span className="t-mono muted">one row per paper</span>
              </div>

              {DEMO.map(row => (
                <div className="merged-row" key={row.title}>
                  <span>{row.title}</span>
                  <span className="dots" aria-hidden="true">
                    {row.held.map(id => (
                      <i key={id} style={{ background: SOURCE_COLOR[id] }} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 — what one paper carries */}
      <section className="section" aria-labelledby="record-h" style={{ ['--h' as string]: 1 }}>
        <div className="wrap">
          <div className="grid record-grid">
            <div className="span-6">
              <h2 id="record-h" className="t-h2">
                What one search returns.
              </h2>
              <p className="t-lead record__lead">
                Abstract, authors, every catalog that holds it, and a citation in APA, MLA, BibTeX
                or RIS. Saved papers stay in your browser.
              </p>

              <div className="record__links">
                <Link className="text-action" href="/saved">
                  Open your library
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 6h8" />
                    <path d="M4.5 2.5 8 6l-3.5 3.5" />
                  </svg>
                </Link>
                <Link className="text-action" href="/search?q=quantum+error+correction">
                  See a live search
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 6h8" />
                    <path d="M4.5 2.5 8 6l-3.5 3.5" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="span-6 start-7">
              <div className="win" data-ui>
                <div className="win__bar">
                  <span className="win__dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>
                    Nature · <b>2024</b>
                  </span>
                  <span className="win__sp" />
                  <span className="win__bar-meta">saved</span>
                </div>

                <div className="win__body win__body--pad">
                  <div className="rec">
                    <div className="rec__top">
                      <span className="badge">OpenAlex</span>
                      <span className="badge">Open access</span>
                      <span className="t-mono muted">1.3K cited</span>
                    </div>
                    <h3 className="rec__title">
                      Quantum error correction below the surface code threshold
                    </h3>
                    <p className="rec__authors">Google Quantum AI and Collaborators</p>
                    <p className="rec__abstract">
                      Two below-threshold surface code memories on Willow: a distance-7 code, and a
                      distance-5 code with a real-time decoder. Doubling the code distance
                      suppressed the logical error rate 2.14 times.
                    </p>
                    <div className="rec__meta">
                      <span>doi.org/10.1038/s41586-024-08449-y</span>
                      <span>Nature 638, 920–926</span>
                    </div>
                    <div className="rec__held">
                      <span>Also held by</span>
                      <span className="dots" aria-hidden="true">
                        <i style={{ background: SOURCE_COLOR.pubmed }} />
                        <i style={{ background: SOURCE_COLOR.crossref }} />
                        <i style={{ background: SOURCE_COLOR.openalex }} />
                      </span>
                      <span>PubMed · CrossRef · OpenAlex</span>
                    </div>
                  </div>

                  <Citation paper={EXAMPLE_PAPER} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — what there is to search */}
      <section
        className="section ground-surface"
        id="disciplines"
        aria-labelledby="fields-h"
        style={{ ['--h' as string]: 1 }}
      >
        <div className="wrap">
          <div className="section-head">
            <h2 id="fields-h" className="t-h2">
              Search by field.
            </h2>
            <p>Fourteen fields. Each one opens a search you can then filter by source, date and citations.</p>
          </div>

          <div className="index" data-ui>
            {disciplines.map(d => (
              <Link
                key={d.id}
                className="index__row"
                href={`/search?q=${encodeURIComponent(d.query)}`}
              >
                <span className="index__name">{d.name}</span>
                <span className="index__meta">{d.subcategories.slice(0, 3).join(' · ')}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
