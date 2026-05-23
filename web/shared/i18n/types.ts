export type Language = 'zh-TW' | 'en';

export interface StepLink {
  label: string;
  href: string;
}

export interface StepTrigger {
  keyword: string;
  skill: string;
}

export interface GuideStep {
  number: string;
  title: string;
  description: string;
  code?: string;
  triggers?: StepTrigger[];
  outputs?: string[];
  note?: string;
  links: StepLink[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface Translations {
  nav: {
    skills: string;
    categories: string;
    guide: string;
  };
  header: {
    searchPlaceholder: string;
    searchAriaLabel: string;
    menuAriaLabel: string;
  };
  footer: {
    description: string;
    nav: string;
    resources: string;
    home: string;
    allSkills: string;
    categoriesBrowse: string;
    howToUse: string;
    githubProject: string;
    contributeGuide: string;
    license: string;
    builtWith: string;
  };
  home: {
    openSource: string;
    heroDescription: string;
    browseAllSkills: string;
    statsSkills: string;
    statsPublished: string;
    statsCategories: string;
    featuredLabel: string;
    featuredTitle: string;
    featuredSubtitle: string;
    viewAll: string;
    categoriesLabel: string;
    categoriesTitle: string;
    categoriesSubtitle: string;
    categoryCount: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaDescriptionLink: string;
    ctaButton: string;
  };
  skills: {
    pageLabel: string;
    pageTitle: string;
    pageSubtitle: string;
    filterAll: string;
    gridView: string;
    listView: string;
    emptyState: string;
  };
  categories: {
    pageLabel: string;
    pageTitle: string;
    pageSubtitle: string;
    skillsCount: string;
    activeCount: string;
  };
  categoryDetail: {
    breadcrumb: string;
    emptyMessage: string;
    subtitle: string;
  };
  skillDetail: {
    home: string;
    skills: string;
    toc: string;
    updatedAt: string;
  };
  guide: {
    badge: string;
    heroTitle: string;
    heroTitleHighlight: string;
    heroDescription: string;
    browseSkills: string;
    stepsLabel: string;
    stepsTitle: string;
    faqLabel: string;
    faqTitle: string;
    faqSubtitle: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButtonSkills: string;
    ctaButtonContribute: string;
    steps: GuideStep[];
    faqs: GuideFaq[];
  };
  notFound: {
    title: string;
    description: string;
    backHome: string;
  };
  search: {
    placeholder: string;
    emptyHint: string;
    noResults: string;
    navHint: string;
    openHint: string;
    closeHint: string;
  };
  status: {
    active: string;
    deprecated: string;
  };
  sidebar: {
    categories: string;
    allSkills: string;
  };
}
