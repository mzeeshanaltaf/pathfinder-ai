import type { MetadataRoute } from 'next';
import { CAREER_PATHS } from '@/data/roadmap';
import { SITE_URL, pathSlug } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    ...CAREER_PATHS.map((p) => ({
      url: `${SITE_URL}/roadmaps/${pathSlug(p.label)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
