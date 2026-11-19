import type { MetadataRoute } from 'next';
import { CAREER_PATHS } from '@/data/roadmap';
import { CONTENT_UPDATED, SITE_URL, roadmapHref } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CONTENT_UPDATED;
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    ...CAREER_PATHS.map((p) => ({
      url: `${SITE_URL}${roadmapHref(p)}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
  ];
}
