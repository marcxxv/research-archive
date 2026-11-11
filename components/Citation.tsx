'use client';

import { useMemo, useState } from 'react';
import type { CitationFormat, Paper } from '@/lib/types';
import { formatCitation } from '@/lib/citation-formatter';

interface CitationProps {
  paper: Paper;
}

const FORMATS: { id: CitationFormat; label: string }[] = [
  { id: 'apa', label: 'APA' },
  { id: 'bibtex', label: 'BibTeX' },
  { id: 'mla', label: 'MLA' },
  { id: 'ris', label: 'RIS' },
];

export default function Citation({ paper }: CitationProps) {
  const [format, setFormat] = useState<CitationFormat>('apa');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const citation = useMemo(() => formatCitation(paper, format), [paper, format]);

  const copy = async () => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="cite">
      <div className="cite__head">
        <div className="cite__tabs" role="group" aria-label="Citation format">
          {FORMATS.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFormat(f.id);
                setCopied(false);
              }}
              aria-pressed={format === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cite__body">
        <pre>{citation}</pre>
        <button type="button" onClick={copy} className="btn btn--secondary btn--sm cite__copy">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {copyError && <p role="status" className="t-small">Clipboard unavailable. Select the citation text to copy it.</p>}
    </div>
  );
}
