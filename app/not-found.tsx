import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page">
      <div className="wrap">
        <div className="empty" style={{ paddingBlock: 96 }}>
          <p className="t-mono muted">404</p>
          <h1 className="t-h2">This page does not exist</h1>
          <p className="t-lead" style={{ maxWidth: '48ch' }}>
            The link may be broken, or the page may have moved. Search the literature instead.
          </p>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <Link href="/search" className="btn btn--primary">
              Search papers
            </Link>
            <Link href="/" className="btn btn--secondary">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
