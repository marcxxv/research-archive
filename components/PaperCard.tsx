'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Paper } from '@/lib/types';
import { formatAuthors, formatNumber, formatDate } from '@/lib/utils';
import Badges from './Badges';
import Citation from './Citation';

interface PaperCardProps {
  paper: Paper;
  onSave?: (paper: Paper) => void;
  isSaved?: boolean;
  variant?: 'row' | 'compact';
}

export default function PaperCard({ paper, onSave, isSaved = false, variant = 'row' }: PaperCardProps) {
  const [showCitation, setShowCitation] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const year = paper.date ? new Date(paper.date).getFullYear() : null;

  const saveButton = onSave ? (
    <button
      type="button"
      onClick={() => onSave(paper)}
      className="icon-btn"
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from library' : 'Save to library'}
      title={isSaved ? 'Saved' : 'Save to library'}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  ) : null;

  if (variant === 'compact') {
    return (
      <article className="card" style={{ gap: 8, padding: 20 }}>
        <Link href={`/paper/${encodeURIComponent(paper.id)}`} className="result__title">
          {paper.title}
        </Link>
        <p className="result__authors">
          {formatAuthors(paper.authors, 2)}
          {year ? ` · ${year}` : ''}
        </p>
        <div className="result__foot" style={{ marginTop: 'auto' }}>
          <span className="t-mono muted">{paper.citations > 0 ? `${formatNumber(paper.citations)} cited` : 'No citations yet'}</span>
          {saveButton && <div className="result__actions">{saveButton}</div>}
        </div>
      </article>
    );
  }

  return (
    <article className="result">
      <div className="result__top">
        <Badges paper={paper} />
        <span className="t-mono muted">
          {paper.date ? formatDate(paper.date) : 'Undated'}
          {paper.citations > 0 ? ` · ${formatNumber(paper.citations)} cited` : ''}
        </span>
      </div>

      <Link href={`/paper/${encodeURIComponent(paper.id)}`} className="result__title">
        {paper.title}
      </Link>

      {paper.authors.length > 0 && (
        <p className="result__authors">{formatAuthors(paper.authors, 4)}</p>
      )}

      {paper.abstract ? <div><p className={`result__abstract${expanded ? ' is-expanded' : ''}`}>{paper.abstract}</p>{paper.abstract.length > 240 && <button className="result__expand" type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>{expanded ? 'Less' : 'Read abstract'}</button>}</div> : <p className="result__no-abstract">Abstract not supplied by this catalog.</p>}

      <div className="result__foot">
        <span className="t-small muted">{paper.journal}</span>
        <div className="result__actions">
          <button
            type="button"
            onClick={() => setShowCitation(v => !v)}
            className={`result__cite${showCitation ? ' is-on' : ''}`}
            aria-expanded={showCitation}
            aria-label={showCitation ? 'Hide citation' : 'Show citation'}
            title="Cite this paper"
          >
            <span>Cite</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.5 6C7 7.4 5.5 9.9 5.5 13v5h5v-6h-3c0-2 .6-3.2 2-4.2z" />
              <path d="M19 6c-2.5 1.4-4 3.9-4 7v5h5v-6h-3c0-2 .6-3.2 2-4.2z" />
            </svg>
          </button>
          <a href={paper.url} className="text-action" target="_blank" rel="noopener noreferrer">Open paper ↗</a>
          {saveButton}
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
              aria-label="Open the PDF"
              title="Open the PDF"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {showCitation && (
        <div style={{ marginTop: 12 }}>
          <Citation paper={paper} />
        </div>
      )}
    </article>
  );
}
