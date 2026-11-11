'use client';

import { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import disciplines from '@/data/disciplines.json';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import FilterSidebar, { FilterState, defaultFilters } from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { SearchResultsSkeleton } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import { toggleSavedPaper, useSavedIds } from '@/lib/saved-papers';
import type { Paper, PaperSource, SearchResult, SortOption } from '@/lib/types';

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Newest' },
  { value: 'citations', label: 'Cited' },
];

function getDateRange(range: FilterState['dateRange']): { from: string; to: string } | undefined {
  if (range === 'all') return undefined;
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let fromMs: number;
  switch (range) {
    case 'week': fromMs = now.getTime() - 7 * 86400000; break;
    case 'month': fromMs = now.getTime() - 30 * 86400000; break;
    case 'year': fromMs = now.getTime() - 365 * 86400000; break;
  }
  return { from: new Date(fromMs).toISOString().split('T')[0], to };
}

function paramsToFilters(sp: URLSearchParams): FilterState {
  const validSources = new Set(defaultFilters.sources);
  const sources = sp.get('sources')?.split(',').filter((s): s is PaperSource => validSources.has(s as PaperSource));
  const range = sp.get('range');
  const sort = sp.get('sort');
  return {
    sources: sources?.length ? [...new Set(sources)] : defaultFilters.sources,
    accessType: sp.get('access') === 'open' ? 'open' : 'any',
    dateRange: range === 'week' || range === 'month' || range === 'year' ? range : 'all',
    citationMin: Math.max(0, parseInt(sp.get('citationMin') || '0', 10) || 0),
    discipline: disciplines.some(d => d.id === sp.get('discipline')) ? sp.get('discipline')! : '',
    sort: sort === 'date' || sort === 'citations' || sort === 'relevance' ? sort : sp.get('q')?.trim() ? 'relevance' : 'date',
  };
}

function filtersToParams(query: string, page: number, filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('q', query);
  if (page > 1) params.set('page', String(page));
  if (filters.sort !== defaultFilters.sort) params.set('sort', filters.sort);
  if (filters.accessType !== defaultFilters.accessType) params.set('access', filters.accessType);
  if (filters.dateRange !== defaultFilters.dateRange) params.set('range', filters.dateRange);
  if (filters.citationMin > 0) params.set('citationMin', String(filters.citationMin));
  if (filters.discipline) params.set('discipline', filters.discipline);
  if (filters.sources.length < defaultFilters.sources.length) {
    params.set('sources', filters.sources.join(','));
  }
  return params;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addToast, ToastContainer } = useToast();

  const query = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [lastQuery, setLastQuery] = useState(query);
  const savedIds = useSavedIds();

  if (query !== lastQuery) {
    setLastQuery(query);
    if (!query.trim()) {
      setResults(null);
      setError('');
    }
  }

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    Promise.resolve().then(() => {
      if (cancelled) return;
      setIsLoading(true);
      setError('');
    });

    const body = {
      query,
      page,
      limit: 20,
      sources: filters.sources,
      accessType: filters.accessType,
      sort: filters.sort,
      citationMin: filters.citationMin > 0 ? filters.citationMin : undefined,
      discipline: filters.discipline || undefined,
      dateRange: getDateRange(filters.dateRange),
    };

    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Search failed');
        }
        return res.json() as Promise<SearchResult>;
      })
      .then(data => {
        if (!cancelled) setResults(data);
      })
      .catch(err => {
        if (cancelled || (err instanceof Error && err.name === 'AbortError')) return;
        setError(err instanceof Error ? err.message : 'An error occurred');
        setResults(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query, page, filters, retry]);

  const updateUrl = useCallback(
    (nextQuery: string, nextPage: number, nextFilters: FilterState, options: { scrollTop?: boolean } = {}) => {
      const params = filtersToParams(nextQuery, nextPage, nextFilters);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      if (options.scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, pathname]
  );

  const handleSearch = (q: string) => updateUrl(q, 1, filters);
  const handleFilterChange = (next: FilterState) => updateUrl(query, 1, next);
  const handleResetFilters = () => updateUrl(query, 1, defaultFilters);
  const handlePageChange = (nextPage: number) => updateUrl(query, nextPage, filters, { scrollTop: true });

  const handleSave = (paper: Paper) => {
    const { saved } = toggleSavedPaper(paper);
    addToast(saved ? 'Added to your library' : 'Removed from library', saved ? 'success' : 'info');
  };

  const showInitialSkeleton = isLoading && !results;

  return (
    <div className="page search-page">
      <div className="wrap">
        <div className="search-page__heading">
          <div><h1>{query ? 'Search results' : 'Discover research'}</h1>
          <p>{query ? `Papers matching “${query}”` : 'A fresh starting point, drawn from four scholarly catalogs.'}</p></div>
          <Link href="/saved" className="text-action">Open your library →</Link>
        </div>

        <div className="search-top">
          <SearchBar
            initialQuery={query}
            onSearch={handleSearch}
            size="lg"
            submitLabel="Search papers"
            placeholder="Topic, author or DOI"
          />
        </div>

        <div className="results-grid">
          <FilterSidebar filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} sourcesQueried={results?.sourcesQueried} errors={results?.errors} loading={isLoading} />

          <div className="results-main" aria-busy={isLoading}>
            <h2 className="results-heading">{query ? 'Matching papers' : 'Recent papers'}</h2>
            <div className="toolbar">
              <p className="toolbar__count" aria-live="polite">
                {results && !showInitialSkeleton ? (
                  <>
                    <b>{results.papers.length}</b> papers shown
                    <span className="muted"> · {results.sourcesQueried.length - (results.errors?.length || 0)} of {results.sourcesQueried.length} catalogs responded</span>
                  </>
                ) : (
                  <span className="muted">{isLoading ? 'Searching selected databases…' : query ? 'No results loaded' : 'Ready to search'}</span>
                )}
              </p>

              <div className="segmented" role="group" aria-label="Sort results">
                {SORTS.filter(opt => query.trim() || opt.value !== 'relevance').map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={filters.sort === opt.value}
                    onClick={() => handleFilterChange({ ...filters, sort: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {results?.errors && results.errors.length > 0 && (
              <p className="t-small muted" style={{ marginTop: 12 }}>
                {results.errors.length === results.sourcesQueried.length ? 'The catalogs are unavailable right now.' : 'Some catalogs did not respond. Available results are shown.'} {results.errors.map(e => e.source).join(', ')}. <button type="button" className="text-action" onClick={() => setRetry(r => r + 1)}>Retry sources</button>
              </p>
            )}

            {error && (
              <div className="panel" style={{ marginTop: 24, borderColor: 'var(--line-strong)' }}>
                <p className="t-small strong">{error}</p>
                <p className="t-small muted" style={{ marginTop: 6 }}>Try again in a moment, or remove a filter.</p>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setRetry(r => r + 1)}>Try again</button>
              </div>
            )}

            <div className={`results-list${isLoading && results ? ' is-loading' : ''}`}>
              {showInitialSkeleton && <SearchResultsSkeleton count={6} />}

              {!showInitialSkeleton &&
                results?.papers.map(paper => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onSave={handleSave}
                    isSaved={savedIds.has(paper.id)}
                  />
                ))}
            </div>

            {!showInitialSkeleton && results && results.papers.length === 0 && (
              <div className="empty">
                <h2 className="t-h3">{query ? `No papers found for “${query}”` : 'No recent papers match these filters'}</h2>
                <p className="t-small muted">
                  Fewer filters, a broader phrase, or a check on the spelling usually fixes it. The
                  indexes hold titles and abstracts, not full text.
                </p>
                {filters.sources.length < 4 || filters.accessType !== 'any' || filters.dateRange !== 'all' || filters.citationMin > 0 || filters.discipline ? (
                  <button type="button" className="btn btn--secondary btn--sm" onClick={handleResetFilters}>
                    Clear filters
                  </button>
                ) : null}
              </div>
            )}


            {results && results.pages > 1 && (
              <div className="results-pager">
                <Pagination
                  currentPage={page}
                  totalPages={Math.min(results.pages, 50)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="page">
          <div className="wrap">
            <SearchResultsSkeleton count={6} />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
