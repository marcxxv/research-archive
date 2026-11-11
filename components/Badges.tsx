import type { Paper, PaperSource } from '@/lib/types';

interface BadgesProps {
  paper: Paper;
}

const SOURCE_LABEL: Record<PaperSource, string> = {
  arxiv: 'arXiv',
  pubmed: 'PubMed',
  crossref: 'CrossRef',
  openalex: 'OpenAlex',
};

export default function Badges({ paper }: BadgesProps) {
  return (
    <>
      <span className="badge">{SOURCE_LABEL[paper.source]}</span>
      <span className={`badge ${paper.accessType === 'open' ? 'badge--open' : 'badge--restricted'}`}>
        {paper.accessType === 'open' ? 'Open access' : 'Paywalled'}
      </span>
    </>
  );
}
