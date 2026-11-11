import type { Metadata, Viewport } from 'next';
import { Chivo, Chivo_Mono } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const chivo = Chivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-chivo',
  display: 'swap',
});

const chivoMono = Chivo_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-chivo-mono',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://research-archive.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'ResearchArchive — Academic search across 260M papers',
    template: '%s · ResearchArchive',
  },
  description:
    'One search box over arXiv, PubMed, CrossRef and OpenAlex. Results are merged on DOI and deduplicated. Free, no account, and your library stays in your browser.',
  keywords: [
    'academic search',
    'research papers',
    'arXiv',
    'PubMed',
    'CrossRef',
    'OpenAlex',
    'open access',
    'citations',
  ],
  authors: [{ name: 'ResearchArchive' }],
  openGraph: {
    title: 'ResearchArchive — Academic search across 260M papers',
    description:
      'Search arXiv, PubMed, CrossRef and OpenAlex at once. One merged, deduplicated list. No account.',
    type: 'website',
    url: APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResearchArchive',
    description: 'Academic search across 260M papers from four databases, merged into one list.',
  },
  robots: { index: true, follow: true },
  other: {
    'page-type': 'software',
    'site-kind': 'software',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e0f' },
  ],
};

const themeBootstrap = `
(function(){try{
  var key='theme';
  var stored=localStorage.getItem(key);
  var dark=stored==='dark'||(!stored&&matchMedia('(prefers-color-scheme: dark)').matches);
  var theme=dark?'dark':'light';
  document.documentElement.setAttribute('data-theme',theme);
  document.documentElement.style.colorScheme=theme;
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-type="software"
      data-radius="soft"
      data-buttons="pill"
      className={`${chivo.variable} ${chivoMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
