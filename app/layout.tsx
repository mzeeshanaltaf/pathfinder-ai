import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import { SEO_DESCRIPTION, SEO_TITLE, SITE_NAME, SITE_URL } from '@/lib/seo';
import './globals.css';

const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  // Absolute URLs for canonical + Open Graph; set NEXT_PUBLIC_SITE_URL when deploying.
  metadataBase: new URL(SITE_URL),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['AI roadmap', 'AI Developer', 'AI Engineer', 'Forward Deployed Engineer', 'learn AI', 'career path', '3D game'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    siteName: SITE_NAME,
    type: 'website',
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
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
