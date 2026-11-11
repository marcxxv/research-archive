'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SearchResult } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function DiscoveryPreview() {
  const [data, setData] = useState<SearchResult | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/search?q=&sort=date&limit=3', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('Unavailable'); return r.json(); })
      .then(setData)
      .catch(e => { if (e.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, []);
  return <div className="discovery-preview" data-ui data-visual>
    <div className="discovery-preview__head"><h2>Recently published</h2><Link href="/search">Browse all →</Link></div>
    {!data && !error && <div className="discovery-preview__loading" role="status">Looking through the catalogs…<div className="sk" /><div className="sk" /></div>}
    {(error || (data && data.papers.length === 0)) && <p className="discovery-preview__empty">Recent papers are unavailable. <Link href="/search">Browse research →</Link></p>}
    {data?.papers.slice(0, 3).map(paper => <Link key={paper.id} className="discovery-preview__paper" href={`/paper/${encodeURIComponent(paper.id)}`}><span>{paper.publicationType || 'Paper'} · {paper.source}</span><h3>{paper.title}</h3><time dateTime={paper.date}>{formatDate(paper.date)}</time></Link>)}
    <p className="discovery-preview__note">Across four catalogs. Newest first.</p>
  </div>;
}
