# ResearchArchive interface

Updated 2026-11-11. The executable design source is `app/globals.css`; components use its shared classes and tokens directly.

## Direction

Chivo for reading and display, Chivo Mono for literal citation code; white and charcoal surfaces with blue actions. The homepage opens with live recent papers, then explains merged search using illustrative records and offers a working citation example and discipline links. Product pages use the same type, controls and spacing without repeating the homepage pitch.

## Tokens and components

- Surfaces: `--bg`, `--surface`, `--card`; text: `--ink`, `--muted`.
- Actions: `--accent`, `--action`, `--action-ink`.
- Spacing: `--s-1` through `--s-10`; radii: `--r-sm`, `--r-md`, `--r-lg`, `--r-btn`.
- Type: `.t-h1`, `.t-h2`, `.t-h3`, `.t-lead`, `.t-small`, `.t-mono`.
- Controls: `.btn` with `--primary`, `--secondary`, `--ghost` and size modifiers; `.icon-btn`, `.chip`, `.input`.
- Results: `.result`, `.result__title`, `.result__foot`; citation controls: `.cite`; filtering: `.filters`, `.filter-group` and `.source-option`.

## Flow and accessibility

Search state stays in the URL. A homepage GET form works before hydration; result-page searches preserve filters. Mobile filters expand inline. Paper records offer saving, citation formats, sharing and original-source links. The library supports import even when empty, validates records, deduplicates imports and exports standard citation files or JSON.

Theme selection persists in browser storage and is applied before paint. Keyboard focus remains visible, the skip link targets main content, autocomplete uses unique accessible IDs, and motion respects reduced-motion preferences. Content sections grow rather than clipping at a fixed viewport height. The hero uses a compact layout on short phones, with the loading state bounded as well as the paper list. The filter rail uses native checkboxes, radio buttons and selects; its mobile panel has a bounded scroll area and an explicit Show papers action. Recent results are loaded automatically and show publication type, full publication dates and source actions.

## Honest examples

The first-screen recent-paper list uses live records and paper-detail links. The source-merging list further down is labeled through its explanatory context and uses illustrative records. Displayed example counts are illustrative, not measured search speed or current coverage. Citation tabs use the same working component as actual paper pages; clipboard failures show a manual-copy instruction. Source API availability remains independent of this interface redesign.

## Verification

Before publication run `npm run lint` and `npm run build`, then inspect the homepage, search states, paper details, library and 404 at desktop, tablet and phone widths in both themes. Check actual search separately from controlled interface fixtures.
