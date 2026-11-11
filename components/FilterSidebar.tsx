'use client';

import { useState } from 'react';
import type { PaperSource, SortOption, SourceError } from '@/lib/types';
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
  sourcesQueried?: PaperSource[];
  errors?: SourceError[];
  loading?: boolean;
}
const SOURCES: { value: PaperSource; label: string; description: string }[] = [
  { value: 'arxiv', label: 'arXiv', description: 'Preprints & emerging work' },
  { value: 'pubmed', label: 'PubMed', description: 'Medicine & life sciences' },
  { value: 'crossref', label: 'Crossref', description: 'Published research & DOIs' },
  { value: 'openalex', label: 'OpenAlex', description: 'Research across disciplines' },
];
export const defaultFilters: FilterState = {
  sources: ['arxiv', 'pubmed', 'crossref', 'openalex'], accessType: 'any',
  dateRange: 'all', citationMin: 0, discipline: '', sort: 'relevance',
};
export default function FilterSidebar({ filters, onChange, onReset, sourcesQueried, errors, loading }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const activeCount = Number(filters.sources.length < 4) + Number(filters.accessType !== 'any') + Number(filters.dateRange !== 'all') + Number(filters.citationMin > 0) + Number(!!filters.discipline);
  return <aside className="filters" aria-label="Refine papers">
    <button type="button" className="filters__toggle" onClick={() => setIsOpen(v => !v)} aria-expanded={isOpen} aria-controls="filter-body"><span>Refine papers {activeCount > 0 && <span className="filters__count">{activeCount}</span>}</span><span aria-hidden="true">{isOpen ? '−' : '+'}</span></button>
    <div className="filters__body" id="filter-body" data-open={isOpen}>
      <div className="filters__heading"><h2>Refine papers</h2><button type="button" onClick={onReset} disabled={!activeCount} className="filters__reset">Reset</button></div>
      <fieldset className="filter-group"><legend>Catalogs <span>{filters.sources.length} selected</span></legend><div className="source-options">
        {SOURCES.map(source => {
          const checked = filters.sources.includes(source.value);
          const failed = errors?.some(e => e.source === source.value);
          const status = !checked ? 'Not selected' : loading ? 'Searching…' : failed ? 'Unavailable' : sourcesQueried?.includes(source.value) ? 'Responded' : '';
          return <label className="source-option" key={source.value} data-checked={checked}>
            <input type="checkbox" checked={checked} disabled={checked && filters.sources.length === 1} onChange={() => update({ sources: checked ? filters.sources.filter(s => s !== source.value) : [...filters.sources, source.value] })} />
            <span><strong>{source.label}</strong><small>{source.description}</small><small className={`source-option__status${failed ? ' is-unavailable' : ''}`}>{status}</small></span>
          </label>;
        })}
      </div></fieldset>
      <div className="filter-group"><label htmlFor="field-filter">Research field</label><select id="field-filter" className="input" value={filters.discipline} onChange={e => update({ discipline: e.target.value })}><option value="">All fields</option>{disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
      <div className="filter-group"><label htmlFor="date-filter">Publication date</label><select id="date-filter" className="input" value={filters.dateRange} onChange={e => update({ dateRange: e.target.value as FilterState['dateRange'] })}><option value="all">Any time</option><option value="week">Past week</option><option value="month">Past month</option><option value="year">Past year</option></select></div>
      <fieldset className="filter-group"><legend>Full-text access</legend><label className="filter-radio"><input type="radio" name="access" checked={filters.accessType === 'any'} onChange={() => update({ accessType: 'any' })} />All papers</label><label className="filter-radio"><input type="radio" name="access" checked={filters.accessType === 'open'} onChange={() => update({ accessType: 'open' })} />Open access only</label></fieldset>
      <div className="filter-group"><label htmlFor="citations-filter">Minimum citations</label><select id="citations-filter" className="input" value={filters.citationMin} onChange={e => update({ citationMin: Number(e.target.value) })}>{[0, 10, 50, 100, 500].map(n => <option key={n} value={n}>{n === 0 ? 'Any citation count' : `${n}+ citations`}</option>)}</select><p className="filter-help">New papers may not have citations yet.</p></div>
      <button type="button" className="btn btn--primary filters__apply" onClick={() => setIsOpen(false)}>Show papers</button>
    </div>
  </aside>;
}
