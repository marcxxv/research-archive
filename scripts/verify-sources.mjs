// Live integration check: starts no services and prints no credentials.
// Run against a running preview: node scripts/verify-sources.mjs http://localhost:3118
import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://localhost:3000';
const today = new Date().toISOString().slice(0, 10);
const results = await Promise.all(['arxiv', 'pubmed', 'crossref', 'openalex'].map(async source => {
  let sample;
  for (const query of ['quantum error correction', '']) {
    const response = await fetch(`${base}/api/search`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, sources: [source], limit: 3, sort: query ? 'relevance' : 'date' }),
      signal: AbortSignal.timeout(95000),
    });
    assert.equal(response.status, 200, `${source}: search HTTP status`);
    const data = await response.json();
    assert.equal(data.errors?.length || 0, 0, `${source}: no hidden provider failure`);
    assert(data.papers.length > 0, `${source}: actual parsed papers returned`);
    assert(data.papers.every(p => p.id && p.title && p.publicationType && p.source === source), `${source}: identity and paper type`);
    if (!query) {
      assert(data.papers.every(p => p.date && p.date.slice(0, 10) <= today), `${source}: recent feed excludes future publications`);
      assert(data.papers.every((p, i) => i === 0 || Date.parse(data.papers[i - 1].date) >= Date.parse(p.date)), `${source}: newest first`);
      assert(data.papers.every(p => p.publicationType !== 'paratext'), `${source}: no journal front matter`);
    } else sample = data.papers[0];
  }
  const response = await fetch(`${base}/api/papers/${encodeURIComponent(sample.id)}`, { signal: AbortSignal.timeout(95000) });
  assert.equal(response.status, 200, `${source}: paper detail resolves`);
  const paper = await response.json();
  assert.equal(paper.title, sample.title, `${source}: detail matches search result`);
  return { source, search: 'passed', recent: 'passed', detail: 'passed' };
}));
const healthResponse = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(95000) });
assert.equal(healthResponse.headers.get('cache-control'), 'no-store', 'health is live');
const health = await healthResponse.json();
assert.equal(health.status, 'healthy', 'all source adapters functional');
assert(Object.values(health.sources).every(s => s.status !== 'down'), 'slow successful sources remain functional');
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), results, health }, null, 2));
