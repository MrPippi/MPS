import { getAllSkills, getFeaturedSkills, getCategories } from '@/features/skills';
import { HomePageClient } from '@/features/home/HomePageClient';

export default function HomePage() {
  const featuredSkills = getFeaturedSkills();
  const allSkills = getAllSkills();
  const categories = getCategories();
  const activeCount = allSkills.filter((s) => s.status === 'active').length;

  return (
    <HomePageClient
      skills={allSkills}
      featuredSkills={featuredSkills}
      categories={categories}
      activeCount={activeCount}
    />
  );
}
