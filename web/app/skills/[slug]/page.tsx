import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllSkills, getSkillBySlug } from '@/lib/skills';
import { SkillDetail } from '@/components/skills/SkillDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const skills = getAllSkills();
  return skills.map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return { title: 'Skill Not Found' };
  }

  return {
    title: skill.titleZh,
    description: skill.descriptionZh,
    openGraph: {
      title: `${skill.titleZh} | MPS`,
      description: skill.descriptionZh,
    },
  };
}

export default async function SkillPage({ params }: Props) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SkillDetail skill={skill} />
    </div>
  );
}
