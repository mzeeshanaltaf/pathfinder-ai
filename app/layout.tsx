import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const DESCRIPTION =
  'Find your path into AI. Walk the AI Developer, AI Engineer and AI Forward Deployed Engineer roadmaps across a cartoon world of floating islands: collect skills, play challenges, track projects and reach the Summit.';

export const metadata: Metadata = {
  // Absolute URLs for the Open Graph image; set NEXT_PUBLIC_SITE_URL when deploying.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Pathfinder AI · Find your path into AI',
  description: DESCRIPTION,
  applicationName: 'Pathfinder AI',
  keywords: ['AI roadmap', 'AI Developer', 'AI Engineer', 'Forward Deployed Engineer', 'learn AI', 'career path', '3D game'],
  openGraph: {
    title: 'Pathfinder AI',
    description: DESCRIPTION,
    siteName: 'Pathfinder AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathfinder AI',
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#bfe0fb',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">
        {children}
        {/* The Passport's Roadmap tab portals its printable document here (hidden on screen). */}
        <div id="print-root" />
        {/* Self-hosted Umami analytics; NEXT_PUBLIC_* vars are inlined at build time. */}
        {UMAMI_SCRIPT_URL && UMAMI_WEBSITE_ID && (
          <Script src={UMAMI_SCRIPT_URL} data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
