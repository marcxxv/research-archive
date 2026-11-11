'use client';

import { useState, useRef, useEffect, useMemo, useId } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';
import type { Suggestion } from '@/lib/types';

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'md' | 'lg';
  variant?: 'page' | 'bar';
  showSubmit?: boolean;
  submitLabel?: string;
}

export default function SearchBar({
  initialQuery = '',
  onSearch,
  placeholder = 'Topic, author or DOI',
  autoFocus = false,
  size = 'md',
  variant = 'page',
  showSubmit = true,
  submitLabel = 'Search',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastInitial, setLastInitial] = useState(initialQuery);
  const router = useRouter();
  const suggestionsId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  if (initialQuery !== lastInitial) {
    setLastInitial(initialQuery);
    setQuery(initialQuery);
  }

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (value: string) => {
        const trimmed = value.trim();
        if (trimmed.length < 3) {
          setSuggestions([]);
          setIsLoading(false);
          return;
        }
        const requestId = ++requestIdRef.current;
        setIsLoading(true);
        try {
          const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}&limit=6`);
          if (!res.ok) throw new Error('failed');
          const data: { suggestions: Suggestion[] } = await res.json();
          if (requestId === requestIdRef.current) setSuggestions(data.suggestions || []);
        } catch {
          if (requestId === requestIdRef.current) setSuggestions([]);
        } finally {
          if (requestId === requestIdRef.current) setIsLoading(false);
        }
      }, 220),
    []
  );

  useEffect(() => () => fetchSuggestions.cancel(), [fetchSuggestions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    requestIdRef.current += 1;
    setSuggestions([]);
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const submit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    inputRef.current?.blur();
    if (onSearch) onSearch(trimmed);
    else router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    // without an onSearch handler the form is a plain GET to /search?q=…, so it works before
    // hydration and the browser owns the navigation
    if (!onSearch) return;
    e.preventDefault();
    submit(query);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
    router.push(`/paper/${encodeURIComponent(suggestion.id)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
    const onGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [autoFocus]);

  const hasPanel = showSuggestions && (suggestions.length > 0 || isLoading);

  return (
    <div
      ref={wrapperRef}
      className={`search${variant === 'bar' ? ' search--bar' : ''}${size === 'lg' ? ' search--lg' : ''}`}
    >
      <form onSubmit={handleSubmit} action="/search" method="get" role="search">
        <div className="search__box">
          <span className="search__icon" aria-hidden="true">
            {isLoading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="spin" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7.5" />
                <path d="m20.5 20.5-4.3-4.3" />
              </svg>
            )}
          </span>

          <input
            ref={inputRef}
            type="text"
            name="q"
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (query.trim().length >= 3 && suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-label="Search papers"
            aria-autocomplete="list"
            role="combobox"
            aria-expanded={hasPanel}
            aria-controls={hasPanel ? suggestionsId : undefined}
            aria-activedescendant={hasPanel && selectedIndex >= 0 ? `${suggestionsId}-${selectedIndex}` : undefined}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                requestIdRef.current += 1;
                fetchSuggestions.cancel();
                setIsLoading(false);
                setShowSuggestions(false);
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="search__clear"
              aria-label="Clear search"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          )}

          {showSubmit && variant === 'page' && (
            <button type="submit" className="search__submit">
              {submitLabel}
            </button>
          )}
        </div>
      </form>

      {hasPanel && (
        <div id={suggestionsId} className="search__suggest" role="listbox">
          {isLoading && suggestions.length === 0 ? (
            <div className="suggest-row">
              <span>Looking through OpenAlex…</span>
            </div>
          ) : (
            <>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={suggestion.id}
                  id={`${suggestionsId}-${idx}`}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  className="suggest-row"
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <b>{suggestion.title}</b>
                  {suggestion.hint && <span>{suggestion.hint}</span>}
                </div>
              ))}
              <div
                className="suggest-row"
                role="option"
                aria-selected={false}
                onClick={() => submit(query)}
              >
                <b>
                  Search all four databases for <em>{query}</em>
                </b>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
