/**
 * Generates public/robots.txt and public/sitemap.xml at build time.
 * Use this when using output: 'export' to avoid Next.js metadata route bug (Issue #68667).
 * Run from web/: npx tsx scripts/generate-static-metadata.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mps.vercel.app';

const webDir = path.join(__dirname, '..');
const publicDir = path.join(webDir, 'public');
const dataSkillsDir = path.join(webDir, 'data', 'skills');

function getAllSkills(): { slug: string; updatedAt?: string; status: string }[] {
  if (!fs.existsSync(dataSkillsDir)) return [];
  const filenames = fs.readdirSync(dataSkillsDir).filter((f: string) => f.endsWith('.md'));
  return filenames
    .map((filename: string) => {
      const fullPath = path.join(dataSkillsDir, filename);
      const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
      if (!data?.id || !data?.title) return null;
      return {
        slug: filename.replace(/\.md$/, ''),
        updatedAt: data.updatedAt,
        status: data.status || 'active',
      };
    })
    .filter(Boolean) as { slug: string; updatedAt?: string; status: string }[];
}

function getCategories(skills: { slug: string }[]): string[] {
  const seen = new Set<string>();
  for (const s of skills) {
    const fullPath = path.join(dataSkillsDir, `${s.slug}.md`);
    if (fs.existsSync(fullPath)) {
      const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
      const cat = data?.category || 'general';
      seen.add(cat);
    }
  }
  return Array.from(seen);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // robots.txt
  const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /_next/
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');
  console.log('Generated public/robots.txt');

  // sitemap.xml
  const skills = getAllSkills();
  const categoryIds = getCategories(skills);

  const staticEntries = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/skills`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const skillEntries = skills.map((s) => ({
    url: `${SITE_URL}/skills/${s.slug}`,
    lastMod: s.updatedAt || new Date().toISOString().slice(0, 10),
    changeFrequency: 'monthly',
    priority: s.status === 'active' ? 0.8 : 0.5,
  }));

  const categoryEntries = categoryIds.map((id) => ({
    url: `${SITE_URL}/categories/${id}`,
    lastMod: new Date().toISOString().slice(0, 10),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const urls = [
    ...staticEntries.map((e) => ({
      loc: e.url,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: e.changeFrequency,
      priority: e.priority,
    })),
    ...skillEntries.map((e) => ({
      loc: e.url,
      lastmod: e.lastMod,
      changefreq: e.changeFrequency,
      priority: e.priority,
    })),
    ...categoryEntries.map((e) => ({
      loc: e.url,
      lastmod: e.lastMod,
      changefreq: e.changeFrequency,
      priority: e.priority,
    })),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('Generated public/sitemap.xml');
}

main();
