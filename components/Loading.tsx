export function ResultSkeleton() {
  return (
    <div style={{ padding: '24px 0', borderTop: '1px solid var(--line)' }}>
      <div className="sk" style={{ height: 18, width: 90, borderRadius: 999 }} />
      <div className="sk" style={{ height: 20, width: '72%', marginTop: 14 }} />
      <div className="sk" style={{ height: 14, width: '38%', marginTop: 10 }} />
      <div className="sk" style={{ height: 14, width: '100%', marginTop: 14 }} />
      <div className="sk" style={{ height: 14, width: '88%', marginTop: 8 }} />
    </div>
  );
}

export function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <ResultSkeleton key={i} />
      ))}
    </div>
  );
}

export function PaperDetailSkeleton() {
  return (
    <div>
      <div className="sk" style={{ height: 14, width: 180 }} />
      <div className="sk" style={{ height: 34, width: '82%', marginTop: 28 }} />
      <div className="sk" style={{ height: 34, width: '54%', marginTop: 10 }} />
      <div className="sk" style={{ height: 16, width: '42%', marginTop: 24 }} />
      <div className="sk" style={{ height: 16, width: '100%', marginTop: 40 }} />
      <div className="sk" style={{ height: 16, width: '96%', marginTop: 10 }} />
      <div className="sk" style={{ height: 16, width: '70%', marginTop: 10 }} />
    </div>
  );
}
