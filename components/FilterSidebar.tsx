'use client';

import { useState } from 'react';
import type { PaperSource, SortOption } from '@/lib/types';
import disciplines from '@/data/disciplines.json';

export interface FilterState {
  sources: PaperSource[];
  accessType: 'open' | 'any';
  dateRange: 'all' | 'year' | 'month' | 'week';
  citationMin: number;
  discipline: string;
  sort: SortOption;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

const SOURCES: { value: PaperSource; label: string; dot: string }[] = [
  { value: 'arxiv', label: 'arXiv', dot: '#b31b1b' },
  { value: 'pubmed', label: 'PubMed', dot: '#326898' },
  { value: 'crossref', label: 'CrossRef', dot: '#ef8b2c' },
  { value: 'openalex', label: 'OpenAlex', dot: '#2563eb' },
];

const ACCESS: { value: FilterState['accessType']; label: string }[] = [
  { value: 'any', label: 'Any access' },
  { value: 'open', label: 'Open only' },
];

const DATES: { value: FilterState['dateRange']; label: string }[] = [
  { value: 'all', label: 'Any date' },
  { value: 'year', label: 'Past year' },
  { value: 'month', label: 'Past month' },
  { value: 'week', label: 'Past week' },
];

const CITATIONS = [0, 10, 50, 100, 500];

export const defaultFilters: FilterState = {
  sources: ['arxiv', 'pubmed', 'crossref', 'openalex'],
  accessType: 'any',
  dateRange: 'all',
  citationMin: 0,
  discipline: '',
  sort: 'relevance',
};

export default function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const toggleSource = (source: PaperSource) => {
    const next = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    if (next.length > 0) update({ sources: next });
  };

  const activeCount =
    (filters.sources.length < SOURCES.length ? 1 : 0) +
    (filters.accessType !== 'any' ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.citationMin > 0 ? 1 : 0) +
    (filters.discipline !== '' ? 1 : 0);

  return (
    <aside className="filters" aria-label="Filters">
      <button
        type="button"
        className="filters__toggle"
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        aria-controls="filter-body"
      >
        <span>
          Filters
          {activeCount > 0 && <span className="filters__count">{activeCount}</span>}
        </span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={isOpen ? 'is-open' : undefined}
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      <div id="filter-body" className="filters__body" data-open={isOpen}>
        <div className="facet">
          <div className="facet__head">
            <span>Sources</span>
            <span className="t-mono">{filters.sources.length}/4</span>
          </div>
          <div className="facet__grid">
            {SOURCES.map(source => {
              const checked = filters.sources.includes(source.value);
              return (
                <label
                  key={source.value}
                  className="facet__check"
                  data-checked={checked}
                  title={checked ? `Remove ${source.label}` : `Add ${source.label}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSource(source.value)}
                  />
                  <i aria-hidden="true">
                    {checked && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6.5 4.5 9 10 3" />
                      </svg>
                    )}
                  </i>
                  <span className="badge__dot" style={{ background: source.dot }} aria-hidden="true" />
                  {source.label}
                </label>
              );
            })}
          </div>
        </div>

        <div className="facet">
          <div className="facet__head">
            <span>Access</span>
          </div>
          <div className="facet__pills">
            {ACCESS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className="chip"
                aria-pressed={filters.accessType === opt.value}
                onClick={() => update({ accessType: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="facet">
          <div className="facet__head">
            <span>Date</span>
          </div>
          <div className="facet__pills">
            {DATES.map(opt => (
              <button
                key={opt.value}
                type="button"
                className="chip"
                aria-pressed={filters.dateRange === opt.value}
                onClick={() => update({ dateRange: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="facet">
          <div className="facet__head">
            <span>At least</span>
          </div>
          <select
            className="input"
            value={filters.citationMin}
            onChange={e => update({ citationMin: Number(e.target.value) || 0 })}
            aria-label="Minimum citations"
          >
            {CITATIONS.map(n => (
              <option key={n} value={n}>
                {n === 0 ? 'Any citation count' : `${n}+ citations`}
              </option>
            ))}
          </select>
        </div>

        <div className="facet">
          <div className="facet__head">
            <span>Field</span>
          </div>
          <select
            className="input"
            value={filters.discipline}
            onChange={e => update({ discipline: e.target.value })}
            aria-label="Field"
          >
            <option value="">All fields</option>
            {(disciplines as { id: string; name: string }[]).map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {activeCount > 0 && (
          <button type="button" className="text-action filters__reset" onClick={onReset}>
            Reset {activeCount === 1 ? 'filter' : `${activeCount} filters`}
          </button>
        )}
      </div>
    </aside>
  );
}
