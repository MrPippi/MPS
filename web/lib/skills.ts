import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import type { SkillMeta, SkillFull, Category, SearchIndex } from '@/types/skill';

const SKILLS_DIR = path.join(process.cwd(), 'data', 'skills');

function parseSkillFile(filename: string): SkillMeta | null {
  const fullPath = path.join(SKILLS_DIR, filename);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(fileContents);

  if (!data.id || !data.title) return null;

  const slug = filename.replace(/\.md$/, '');

  return {
    id: data.id as string,
    slug,
    title: data.title as string,
    titleZh: (data.titleZh as string) || data.title,
    description: (data.description as string) || '',
    descriptionZh: (data.descriptionZh as string) || data.description || '',
    version: (data.version as string) || '0.1.0',
    status: data.status || 'planned',
    category: (data.category as string) || 'general',
    categoryLabel: (data.categoryLabel as string) || data.category || '',
    categoryLabelEn: (data.categoryLabelEn as string) || data.category || '',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    triggerKeywords: Array.isArray(data.triggerKeywords) ? (data.triggerKeywords as string[]) : [],
    updatedAt: (data.updatedAt as string) || '',
    githubPath: (data.githubPath as string) || '',
    featured: Boolean(data.featured),
  };
}

export function getAllSkills(): SkillMeta[] {
  const filenames = fs.readdirSync(SKILLS_DIR).filter((f) => f.endsWith('.md'));
  const skills = filenames
    .map(parseSkillFile)
    .filter((s): s is SkillMeta => s !== null);

  return skills.sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return a.title.localeCompare(b.title);
  });
}

export async function getSkillBySlug(slug: string): Promise<SkillFull | null> {
  const fullPath = path.join(SKILLS_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);

  const contentHtml = processed.toString();

  const meta = parseSkillFile(`${slug}.md`);
  if (!meta) return null;

  return { ...meta, content, contentHtml };
}

export function getSkillsByCategory(categoryId: string): SkillMeta[] {
  return getAllSkills().filter((s) => s.category === categoryId);
}

export function getCategories(): Category[] {
  const skills = getAllSkills();
  const map = new Map<string, Category>();

  for (const skill of skills) {
    const existing = map.get(skill.category);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(skill.category, {
        id: skill.category,
        label: skill.categoryLabel,
        labelEn: skill.categoryLabelEn,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function getFeaturedSkills(): SkillMeta[] {
  return getAllSkills().filter((s) => s.featured);
}

export function getSearchIndex(): SearchIndex[] {
  return getAllSkills().map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    titleZh: s.titleZh,
    description: s.description,
    descriptionZh: s.descriptionZh,
    tags: s.tags,
    category: s.category,
    status: s.status,
  }));
}
