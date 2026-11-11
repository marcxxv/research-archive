import { NextResponse } from 'next/server';
import { searchArxiv } from '@/lib/api/arxiv';
import { searchPubMed } from '@/lib/api/pubmed';
import { searchCrossRef } from '@/lib/api/crossref';
import { searchOpenAlex } from '@/lib/api/openalex';
import type { HealthCheck } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function checkSource(run: () => Promise<{ papers: unknown[] }>) {
  const start = Date.now();
  try {
    const { papers } = await run();
    if (!papers.length) throw new Error('Probe returned no usable papers');
    const latencyMs = Date.now() - start;
    return { status: latencyMs > 3000 ? 'slow' as const : 'up' as const, latencyMs, lastCheck: new Date().toISOString() };
  } catch {
    return { status: 'down' as const, latencyMs: Date.now() - start, lastCheck: new Date().toISOString() };
  }
}

// Probe the same parsing and request paths as search, not a simpler URL that can hide a broken adapter.
export async function GET() {
  const [arxiv, pubmed, crossref, openalex] = await Promise.all([
    checkSource(() => searchArxiv('quantum', { maxResults: 1 })),
    checkSource(() => searchPubMed('cancer', { maxResults: 1, enrichCitations: false })),
    checkSource(() => searchCrossRef('quantum', { rows: 1 })),
    checkSource(() => searchOpenAlex('quantum', { perPage: 1 })),
  ]);
  const sources = { arxiv, pubmed, crossref, openalex };
  const working = Object.values(sources).filter(s => s.status !== 'down').length;
  const health: HealthCheck = { status: working === 4 ? 'healthy' : working > 0 ? 'degraded' : 'unhealthy', sources, timestamp: new Date().toISOString(), version: '2.1.0' };
  return NextResponse.json(health, { headers: { 'Cache-Control': 'no-store' } });
}
