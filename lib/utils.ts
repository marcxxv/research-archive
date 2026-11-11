export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

export function generatePaperId(source: string, externalId: string): string {
  return `${source}:${externalId}`;
}

export function parsePaperId(id: string): { source: string; externalId: string } {
  const idx = id.indexOf(':');
  if (idx === -1) return { source: '', externalId: id };
  return { source: id.slice(0, idx), externalId: id.slice(idx + 1) };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function extractYear(dateString: string): number | null {
  const match = dateString.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

export function formatAuthors(authors: { name: string }[], maxAuthors: number = 3): string {
  if (!authors?.length) return 'Unknown Authors';
  if (authors.length <= maxAuthors) return authors.map(a => a.name).join(', ');
  return `${authors.slice(0, maxAuthors).map(a => a.name).join(', ')} et al.`;
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
  return debounced;
}

export function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<jats:[^>]*>/gi, '')
    .replace(/<\/jats:[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
