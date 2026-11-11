'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PaperCard from '@/components/PaperCard';
import { useToast } from '@/components/Toast';
import { PaperSchema, type Paper, type SavedPaper, type CitationFormat } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { formatCitations } from '@/lib/citation-formatter';
import { clearSavedPapers, toggleSavedPaper, useSavedPapers, writeSavedPapers } from '@/lib/saved-papers';

const EXPORTS: { format: CitationFormat; label: string; ext: string; mime: string }[] = [
  { format: 'bibtex', label: 'BibTeX', ext: 'bib', mime: 'application/x-bibtex' },
  { format: 'ris', label: 'RIS', ext: 'ris', mime: 'application/x-research-info-systems' },
  { format: 'apa', label: 'APA', ext: 'txt', mime: 'text/plain' },
  { format: 'mla', label: 'MLA', ext: 'txt', mime: 'text/plain' },
];

export default function SavedPage() {
  const papers = useSavedPapers();
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...papers].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(sp => {
      const p = sp.paper;
      return (
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.authors.some(a => a.name.toLowerCase().includes(q)) ||
        (p.keywords || []).some(k => k.toLowerCase().includes(q)) ||
        (p.journal || '').toLowerCase().includes(q)
      );
    });
  }, [papers, search]);

  const handleRemove = (paper: Paper) => {
    toggleSavedPaper(paper);
    addToast('Removed from library', 'info');
  };

  const handleClearAll = () => {
    if (!confirm('Remove all saved papers? This cannot be undone.')) return;
    clearSavedPapers();
    addToast('Library cleared', 'info');
  };

  const handleExport = (format: CitationFormat, ext: string, mime: string) => {
    if (filtered.length === 0) return;
    const content = formatCitations(filtered.map(sp => sp.paper), format);
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-archive-library.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${filtered.length} papers as ${format.toUpperCase()}`, 'success');
  };

  const handleExportJson = () => {
    if (papers.length === 0) return;
    const blob = new Blob([JSON.stringify(papers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-archive-library.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Library exported as JSON', 'success');
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const raw: unknown = JSON.parse(text);
      if (!Array.isArray(raw)) throw new Error('Invalid file');
      const incoming: SavedPaper[] = raw.map(item => {
        const parsed = PaperSchema.safeParse(item?.paper);
        if (!parsed.success || typeof item?.savedAt !== 'string' || Number.isNaN(Date.parse(item.savedAt))) {
          throw new Error('Invalid saved paper');
        }
        return { paper: parsed.data, savedAt: item.savedAt };
      });
      const existingIds = new Set(papers.map(p => p.paper.id));
      const merged = [
        ...incoming.filter(item => item?.paper?.id && !existingIds.has(item.paper.id) && !!existingIds.add(item.paper.id)),
        ...papers,
      ];
      const newCount = merged.length - papers.length;
      writeSavedPapers(merged);
      addToast(`Imported ${newCount} papers`, 'success');
    } catch {
      addToast('Failed to import library', 'error');
    }
  };

  if (!mounted) {
    return (
      <div className="page">
        <div className="wrap">
          <div className="sk" style={{ height: 44, width: 220 }} />
          <div className="sk" style={{ height: 96, marginTop: 32 }} />
          <div className="sk" style={{ height: 96, marginTop: 12 }} />
          <div className="sk" style={{ height: 96, marginTop: 12 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="wrap">
        <div className="page-head">
          <div>
            <h1 className="t-h2">Library</h1>
            <p className="t-small muted" style={{ marginTop: 8 }}>
              {papers.length} {papers.length === 1 ? 'paper' : 'papers'} saved. Stored in this
              browser, not on a server.
            </p>
          </div>
          <Link className="btn btn--primary" href="/search">
            Search papers
          </Link>
        </div>

        <div style={{ marginBottom: 24 }}>
              <label className="btn btn--ghost btn--sm" style={{ cursor: 'pointer' }}>
                Import
                <input
                  type="file"
                  accept="application/json"
                  className="sr-only"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                    e.target.value = '';
                  }}
                />
              </label>
        </div>

        {papers.length > 0 && (
          <div className="toolbar">
            <input
              type="search"
              className="input"
              style={{ maxWidth: 320 }}
              placeholder="Filter your library"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Filter your library"
            />

            <div className="toolbar__right">
              <span className="t-label">Export</span>
              {EXPORTS.map(opt => (
                <button
                  key={opt.format}
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => handleExport(opt.format, opt.ext, opt.mime)}
                >
                  {opt.label}
                </button>
              ))}
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleExportJson}>
                JSON
              </button>



              <button type="button" className="btn btn--ghost btn--sm btn--danger" onClick={handleClearAll}>
                Clear all
              </button>
            </div>
          </div>
        )}

        {papers.length === 0 ? (
          <div className="empty">
            <h2 className="t-h3">Nothing saved yet</h2>
            <p className="t-small muted">
              The bookmark on any result keeps the paper here. No account, no sync, no tracking.
            </p>
            <Link href="/search" className="btn btn--secondary btn--sm">
              Find a paper
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h2 className="t-h3">No match for &ldquo;{search}&rdquo;</h2>
            <p className="t-small muted">Titles, authors, journals and keywords are searched.</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setSearch('')}>
              Clear the filter
            </button>
          </div>
        ) : (
          <div className="results-list">
            {filtered.map(sp => (
              <div key={sp.paper.id}>
                <PaperCard paper={sp.paper} onSave={handleRemove} isSaved />
                <p className="saved-stamp" style={{ marginTop: 8 }}>
                  Saved {formatDate(sp.savedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
