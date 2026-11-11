import type { Paper } from '@/lib/types';

function paperScore(paper: Paper): number {
  const abstractScore = (paper.abstract?.length || 0) / 50;
  const authorScore = paper.authors.length * 4;
  const citationScore = Math.log10((paper.citations || 0) + 1) * 8;
  return abstractScore + authorScore + citationScore;
}

function mergePapers(into: Paper, from: Paper): Paper {
  return {
    ...into,
    abstract: into.abstract.length >= from.abstract.length ? into.abstract : from.abstract,
    authors: into.authors.length >= from.authors.length ? into.authors : from.authors,
    citations: Math.max(into.citations, from.citations),
    pdfUrl: into.pdfUrl || from.pdfUrl,
    journal: into.journal || from.journal,
    discipline: into.discipline || from.discipline,
    keywords: into.keywords?.length ? into.keywords : from.keywords,
    accessType: into.accessType === 'open' || from.accessType === 'open' ? 'open' : into.accessType,
    externalIds: { ...from.externalIds, ...into.externalIds },
  };
}

export function deduplicatePapers(papers: Paper[]): Paper[] {
  const merged: Paper[] = [];
  const byDoi = new Map<string, number>();
  const byTitle = new Map<string, number>();
  for (const paper of papers) {
    const doi = paper.externalIds.doi?.toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '').trim();
    const title = paper.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    let index = doi ? byDoi.get(doi) : undefined;
    const titleIndex = title.length > 12 ? byTitle.get(title) : undefined;
    if (index === undefined && titleIndex !== undefined && (!doi || !merged[titleIndex].externalIds.doi)) index = titleIndex;
    if (index === undefined) {
      index = merged.length;
      merged.push(paper);
    } else {
      const existing = merged[index];
      const winner = paperScore(existing) >= paperScore(paper) ? existing : paper;
      merged[index] = mergePapers(winner, winner === existing ? paper : existing);
    }
    if (doi) byDoi.set(doi, index);
    if (title.length > 12) byTitle.set(title, index);
  }
  return merged;
}
