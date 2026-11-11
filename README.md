# ResearchArchive

**Find research that actually moves you forward.**

ResearchArchive is a unified, free, privacy-first academic search engine. It queries
**arXiv, PubMed, CrossRef, and OpenAlex** in parallel, deduplicates the results, and presents
them through a fast, beautiful, accessible interface — built for students, researchers, and
anyone curious about peer-reviewed work.

- 🔎 **One search across 260M+ papers** — not just arXiv, not just PubMed.
- 📥 **Local library** — bookmark papers; no account; saved papers stay in your browser.
- 📑 **Instant citations** in BibTeX, APA, MLA, and RIS.
- ⚡ **Recent research on arrival** — newest-first discovery across all four catalogs before a query, plus OpenAlex autocomplete.
- 🌙 **Dark mode**, keyboard shortcuts (`⌘K`, `/`, `↵`, arrows), and a polished UI.

## Features

- **Unified search** across four scholarly databases with cross-source deduplication by DOI and
  normalized title.
- **Smart relevance ranking** that blends upstream ordering with a freshness boost and a
  logarithmic citation boost.
- **Filters** for source, access type (open vs. restricted), date range, citation count, and
  discipline — every filter is reflected in the URL so results are shareable.
- **Paper detail pages** with abstracts, related papers, and "cited by" listings.
- **Local library** with import/export (BibTeX, RIS, APA, MLA, JSON).
- **Privacy by design** — no accounts, saved papers stay in your
  browser.
- **Fully responsive** with dark mode and `prefers-reduced-motion` support.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Plain CSS with shared custom properties
- **Validation**: Zod 4
- **HTTP**: Axios with retry/backoff and a polite User-Agent
- **XML**: fast-xml-parser (arXiv Atom & PubMed XML)
- **Deployment**: Vercel-ready

## Quick Start

```bash
git clone https://github.com/mnco25/research-archive.git
cd research-archive
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No | Used in metadata. Default `http://localhost:3000`. |
| `RESEARCH_CONTACT_EMAIL` | Recommended | Used in the User-Agent for OpenAlex/CrossRef polite pools. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Fallback for the above. |
| `PUBMED_API_KEY` | No | Lifts PubMed rate limit from 3 → 10 req/s. |

## API Reference

### `POST /api/search`

```json
{
  "query": "large language models",
  "page": 1,
  "limit": 20,
  "sources": ["arxiv", "pubmed", "crossref", "openalex"],
  "accessType": "open",
  "sort": "relevance",
  "citationMin": 10,
  "discipline": "ai",
  "dateRange": { "from": "2025-01-01", "to": "2026-12-31" }
}
```

Returns `{ papers, total, page, pages, searchTimeMs, sourcesQueried, errors? }`.

### `GET /api/search?q=…`

Same as POST, with all filters as query parameters. An omitted or blank query opens recent-paper discovery, newest first; source, date, field, access and citation filters still apply.

### `GET /api/suggest?q=…&limit=6`

Autocomplete (OpenAlex). Returns `{ suggestions: [{ id, title, hint, citations }] }`.

### `GET /api/trending?days=180&limit=8`

Most-cited papers from the lookback window. Cached 30 minutes.

### `GET /api/papers/{id}`

Full paper detail including related and citing papers.

### `POST /api/cite`

```json
{ "paperId": "openalex:W2741809807", "format": "bibtex" }
```

Formats: `bibtex`, `apa`, `mla`, `ris`.

### `GET /api/health`

Live status of all four upstream APIs.

## Data Sources

| Source | Coverage | Rate Limit | Notes |
|---|---|---|---|
| arXiv | 2.5M+ | 1 req / 3 s | Physics, math, CS, more |
| PubMed | 38M+ | 10 req/s with key | Biomedical, life sciences |
| CrossRef | 170M+ | 50 req/s polite pool | Multidisciplinary, DOI registry |
| OpenAlex | See current provider catalog | Provider budget/rate limits apply | Powers autocomplete and one of the four search adapters; see official API access rules |

## Project Structure

See [`CLAUDE.md`](./CLAUDE.md) for a full developer guide.

```
app/
├── api/{search,suggest,trending,papers,cite,health}/route.ts
├── search/page.tsx
├── paper/[id]/page.tsx
├── saved/page.tsx
├── layout.tsx
└── page.tsx
components/
lib/{api,http,search,cache,citation-formatter,saved-papers,theme,types,utils}.ts
data/{disciplines,sources-config}.json
```

## Scripts

```bash
npm run dev      # Dev server with HMR
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Contributing

1. Fork the repo and create your branch (`git checkout -b feat/amazing-feature`).
2. Make your changes, then run `npm run lint && npm run build`.
3. Open a pull request describing what changed and why.

## Roadmap

- [x] Unified search & dedup
- [x] Citations: BibTeX, APA, MLA, RIS
- [x] Library import/export
- [x] Dark mode
- [x] Discipline browsing
- [x] Autocomplete + trending endpoints
- [ ] Author profiles & follow lists
- [ ] AI-powered abstract summaries
- [ ] Browser extension
- [ ] Personalized recommendations (still privacy-first)

## License

MIT

## Acknowledgments

Data via [arXiv](https://arxiv.org), [PubMed](https://pubmed.ncbi.nlm.nih.gov),
[CrossRef](https://www.crossref.org), and [OpenAlex](https://openalex.org). Thank you to the
open-science community keeping research accessible.

---

Built with care for everyone who reads research.

## Interface redesign — 2026-11-11

The taste-skill direction uses Chivo, white/charcoal surfaces and blue actions across the homepage, search, paper details, library and error states. Results use a shared list layout; filters, citations, navigation and exports share one control system. The hero shows live recent records; explanatory examples below remain illustrative. Citation tabs and copying use the real citation component. Sections grow with their content, including on small screens and with enlarged text. Library import is available before saving a first paper.

Vercel Analytics is enabled only in Vercel environments. Saved papers remain in local browser storage; there is no account or library synchronization.

### Discovery and provider verification — 2026-11-11

The hero now uses real navigable recent records. Its loaded, loading and compact-phone layouts are sized for the viewport; illustrative source-merging and citation examples remain in the explanatory sections below. `/search` automatically loads recent papers instead of an empty prompt. The filter rail shows selected catalogs and per-request response status; mobile filters have a bounded scroll panel and a Show papers action. Results expose publication type, full dates, abstracts, citations and source links.

Provider searches now pass newest/citation ordering upstream where supported, rather than sorting only a relevance-ranked batch. OpenAlex no longer selects the unsupported root `is_oa` field. Its feed excludes retracted records and journal front matter. arXiv uses submitted-date ranges, PubMed uses publication-date searches, and Crossref uses published-date sorting. PubMed records are labeled open only when a PMC full-text record is present; missing access evidence is labeled Check full text rather than Paywalled.

`/api/health` exercises real adapter parsing, returns `no-store`, and treats a slow successful source as functional. Source availability is a point-in-time observation, never a permanent guarantee. Recent feeds are cached for 15 minutes; partial failures are cached for only 15 seconds. Catalog publication dates can differ from first online publication, and the merged list is a bounded result batch rather than an exhaustive global chronology.

Run the focused duplicate-merging regression check with `node scripts/verify-search-normalization.mjs`. With the app running, use `node scripts/verify-sources.mjs http://localhost:3118` to verify real search, recent records, detail lookup and adapter health for all four providers. Live checks require network access and respect the existing arXiv request spacing.

Design and API references checked 2026-11-11: [Google Scholar search help](https://scholar.google.com/intl/en/scholar/help.html) for date/refinement and source actions, [PubMed user guide](https://pubmed.ncbi.nlm.nih.gov/help/) for publication dates and full-text access distinctions, [arXiv API manual](https://info.arxiv.org/help/api/user-manual.html) for submitted-date queries, and [OpenAlex select fields](https://help.openalex.org/api/selecting-fields/) for valid request projection.
