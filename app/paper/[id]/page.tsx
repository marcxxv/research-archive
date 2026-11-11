'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Badges from '@/components/Badges';
import Citation from '@/components/Citation';
import PaperCard from '@/components/PaperCard';
import { PaperDetailSkeleton } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import type { PaperDetail } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { readSavedPapers, toggleSavedPaper } from '@/lib/saved-papers';

export default function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/papers/${encodeURIComponent(resolvedParams.id)}`);
        if (!res.ok) throw new Error(res.status === 404 ? 'Paper not found' : 'Failed to load paper');
        const data: PaperDetail = await res.json();
        if (cancelled) return;
        setPaper(data);
        setIsSaved(readSavedPapers().some(sp => sp.paper.id === data.id));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  const handleSave = () => {
    if (!paper) return;
    const { saved } = toggleSavedPaper(paper);
    setIsSaved(saved);
    addToast(saved ? 'Added to your library' : 'Removed from library', saved ? 'success' : 'info');
  };

  const sharePaper = async () => {
    if (!paper) return;
    const url = `${window.location.origin}/paper/${encodeURIComponent(paper.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: paper.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        addToast('Link copied to clipboard', 'success');
      }
    } catch { /* user dismissed share */ }
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="wrap" style={{ maxWidth: 860 }}>
          <PaperDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="page">
        <div className="wrap">
          <div className="empty">
            <h1 className="t-h3">{error || 'Paper not found'}</h1>
            <p className="t-small muted">
              The record could not be loaded. It may have moved, or the catalog is not answering.
            </p>
            <Link href="/search" className="btn btn--primary btn--sm">
              Back to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const related = paper.relatedPapers || [];
  const citing = paper.citedBy || [];

  return (
    <article className="page">
      <div className="wrap">
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/search">Search</Link>
          <span aria-hidden="true">/</span>
          <span>{paper.title.length > 44 ? `${paper.title.slice(0, 44)}…` : paper.title}</span>
        </nav>

        <div className="grid">
          <div className="span-8">
            <header>
              <div className="paper-badges">
                <Badges paper={paper} />
                {paper.discipline && <span className="badge">{paper.discipline}</span>}
              </div>

              <h1 className="paper-title">{paper.title}</h1>

              {paper.authors.length > 0 && (
                <p className="paper-authors">
                  {paper.authors.slice(0, 10).map((author, i) => (
                    <span key={`${author.name}-${i}`}>
                      <Link href={`/search?q=${encodeURIComponent(author.name)}`}>{author.name}</Link>
                      {i < Math.min(paper.authors.length, 10) - 1 && ','}
                    </span>
                  ))}
                  {paper.authors.length > 10 && (
                    <span>+{paper.authors.length - 10} more</span>
                  )}
                </p>
              )}

              <p className="paper-meta">
                {paper.date && <span>{formatDate(paper.date)}</span>}
                {paper.journal && <span>{paper.journal}</span>}
                {paper.citations > 0 && <span>{formatNumber(paper.citations)} citations</span>}
              </p>

              <div className="btn-row" style={{ marginTop: 32 }}>
                {paper.pdfUrl && (
                  <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                    Read the PDF
                  </a>
                )}
                <button type="button" onClick={handleSave} className="btn btn--secondary" aria-pressed={isSaved}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button type="button" onClick={sharePaper} className="btn btn--ghost">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
                  </svg>
                  Share
                </button>
                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-action">
                  Open at {paper.source}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 6h8" />
                    <path d="M4.5 2.5 8 6l-3.5 3.5" />
                  </svg>
                </a>
              </div>
            </header>

            <section className="sec">
              <h2>Abstract</h2>
              {paper.abstract ? (
                <div className="prose">
                  <p>{paper.abstract}</p>
                </div>
              ) : (
                <p className="t-small muted">This record has no abstract in the catalog.</p>
              )}
            </section>

            {paper.keywords && paper.keywords.length > 0 && (
              <section className="sec">
                <h2>Keywords</h2>
                <div className="chips">
                  {paper.keywords.map((kw, i) => (
                    <Link key={`${kw}-${i}`} className="chip" href={`/search?q=${encodeURIComponent(kw)}`}>
                      {kw}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="sec">
              <h2>Cite this paper</h2>
              <Citation paper={paper} />
            </section>

            {related.length > 0 && (
              <section className="sec">
                <h2>Related papers</h2>
                <div className="cards-2">
                  {related.map(p => (
                    <PaperCard key={p.id} paper={p} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {citing.length > 0 && (
              <section className="sec">
                <h2>Cited by</h2>
                <div className="cards-2">
                  {citing.map(p => (
                    <PaperCard key={p.id} paper={p} variant="compact" />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="span-3 start-10">
            <div className="panel info-panel">
              <dl className="info">
                <div>
                  <dt>Citations</dt>
                  <dd>
                    <b>{formatNumber(paper.citations)}</b>
                  </dd>
                </div>
                {paper.journal && (
                  <div>
                    <dt>Published in</dt>
                    <dd>{paper.journal}</dd>
                  </div>
                )}
                <div>
                  <dt>Access</dt>
                  <dd>{paper.accessType === 'open' ? 'Open access' : 'Paywalled'}</dd>
                </div>
                {paper.externalIds.doi && (
                  <div>
                    <dt>DOI</dt>
                    <dd>
                      <a className="link link--ink" href={`https://doi.org/${paper.externalIds.doi}`} target="_blank" rel="noopener noreferrer">
                        {paper.externalIds.doi}
                      </a>
                    </dd>
                  </div>
                )}
                {paper.externalIds.arxivId && (
                  <div>
                    <dt>arXiv</dt>
                    <dd>{paper.externalIds.arxivId}</dd>
                  </div>
                )}
                {paper.externalIds.pmid && (
                  <div>
                    <dt>PMID</dt>
                    <dd>{paper.externalIds.pmid}</dd>
                  </div>
                )}
                <div>
                  <dt>Indexed by</dt>
                  <dd style={{ textTransform: 'capitalize' }}>{paper.source}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>

      <ToastContainer />
    </article>
  );
}
