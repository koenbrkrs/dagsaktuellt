import { client } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import HomeClient from '@/components/HomeClient';
import { Article, Category } from '@/types';

export const revalidate = 60;

// GROQ query for hero articles (3 most recent)
const heroQuery = `*[_type == "post"] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  publishedAt,
  mainImage,
  "authorName": author->name,
  "category": categories[0]->title,
  "excerpt": body
}`;

// GROQ query for all recent articles
const articlesQuery = `*[_type == "post"] | order(publishedAt desc)[0...20] {
  _id,
  title,
  slug,
  publishedAt,
  mainImage,
  "authorName": author->name,
  "category": categories[0]->title,
  "excerpt": body
}`;

// GROQ query for categories with manual background images
const categoriesQuery = `*[_type == "category"] {
  _id,
  title,
  description,
  image
}`;

// GROQ query for featured authors on landing page
const authorsQuery = `*[_type == "author" && showOnLandingPage == true] {
  _id,
  name,
  jobTitle,
  image,
  email,
  social,
  "posts": *[_type == "post" && references(^._id)] {
    "categories": categories[]->title
  }
}`;

// GROQ query for top categories (by post count)
const topCategoriesQuery = `*[_type == "category" && displayInHeader == true]{title}`;

// GROQ query for site settings
const siteSettingsQuery = `*[_type == "siteSettings"][0]`;

// GROQ query for top authors (by post count)
const topAuthorsQuery = `*[_type == "author"]|order(count(*[_type == "post" && references(^._id)]) desc)[0...4]{name}`;

// GROQ query for footer categories (top 4 by article count)
const footerCategoriesQuery = `*[_type == "category"]{
  title,
  "articleCount": count(*[_type == "post" && references(^._id)])
} | order(articleCount desc)[0...4]`;

export default async function Home() {
  // Fetch all data in parallel
  const [heroData, articlesData, categoriesData, authorsData, topCategories, siteSettings, topAuthors, footerCategories] = await Promise.all([
    client.fetch(heroQuery),
    client.fetch(articlesQuery),
    client.fetch(categoriesQuery),
    client.fetch(authorsQuery),
    client.fetch(topCategoriesQuery),
    client.fetch(siteSettingsQuery),
    client.fetch(topAuthorsQuery),
    client.fetch(footerCategoriesQuery),
  ]);

  // Helper function to extract first text from body
  const extractExcerpt = (body: any): { sv: string; en: string } => {
    const svText = body?.sv?.[0]?.children?.[0]?.text || '';
    const enText = body?.en?.[0]?.children?.[0]?.text || '';
    // Fallback for old single-language content
    const fallbackText = body?.[0]?.children?.[0]?.text || '';

    return {
      sv: svText || fallbackText,
      en: enText || fallbackText,
    };
  };

  // Link safe title extraction
  const getSafeTitle = (title: any, lang: 'sv' | 'en'): string => {
    if (!title) return '';
    if (typeof title === 'string') return title;
    const val = typeof title[lang] === 'string' ? title[lang] : '';
    if (val) return val;
    // Cross-fill: try the other language
    const other = lang === 'sv' ? 'en' : 'sv';
    return typeof title[other] === 'string' ? title[other] : '';
  };

  // Transform Sanity data to match Article type
  const transformArticle = (post: any): Article => ({
    id: post.slug?.current || post._id,
    title: {
      sv: getSafeTitle(post.title, 'sv'),
      en: getSafeTitle(post.title, 'en'),
    },
    excerpt: extractExcerpt(post.excerpt),
    content: {
      sv: '',
      en: '',
    },
    category: {
      sv: typeof post.category === 'string' ? post.category : (post.category?.sv || post.category?.en || 'Okategoriserad'),
      en: typeof post.category === 'string' ? post.category : (post.category?.en || post.category?.sv || 'Uncategorized'),
    },
    author: typeof post.authorName === 'string' ? post.authorName : (post.authorName?.en || post.authorName?.sv || 'Unknown'),
    publishDate: new Date(post.publishedAt).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    featured: false,
    image: post.mainImage ? urlForImage(post.mainImage).width(1920).height(1080).url() : undefined,
  });

  // Transform Sanity categories to match Category type
  const transformCategory = (cat: any): Category => ({
    id: cat._id,
    name: {
      sv: getSafeTitle(cat.title, 'sv'),
      en: getSafeTitle(cat.title, 'en'),
    },
    description: {
      sv: getSafeTitle(cat.description, 'sv'),
      en: getSafeTitle(cat.description, 'en'),
    },
    image: cat.image ? urlForImage(cat.image).width(800).height(400).url() : undefined,
  });

  // Transform authors and calculate top categories
  const transformAuthor = (author: any) => {
    // Flatten all categories from author's posts — preserve both sv and en
    const allCategoryPairs = author.posts?.flatMap((post: any) => {
      return post.categories?.map((cat: any) => ({
        sv: cat?.sv || cat?.en || (typeof cat === 'string' ? cat : '') || '',
        en: cat?.en || cat?.sv || (typeof cat === 'string' ? cat : '') || '',
      })) || [];
    }) || [];

    // Count category occurrences by sv key (deduplicate)
    const categoryMap: { [svKey: string]: { sv: string; en: string; count: number } } = {};
    allCategoryPairs.forEach((cat: { sv: string; en: string }) => {
      const key = cat.sv || cat.en;
      if (key) {
        if (!categoryMap[key]) {
          categoryMap[key] = { sv: cat.sv, en: cat.en, count: 0 };
        }
        categoryMap[key].count += 1;
      }
    });

    // Sort by frequency and get top 5 as localized objects
    const topCategories = Object.values(categoryMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(({ sv, en }) => ({ sv, en }));

    return {
      name: author.name || '',
      jobTitle: author.jobTitle?.sv || author.jobTitle?.en || author.jobTitle || '',
      image: author.image ? urlForImage(author.image).width(120).height(120).url() : undefined,
      email: author.email,
      social: author.social,
      topCategories,
    };
  };

  const heroArticles: Article[] = heroData.map(transformArticle);
  const articles: Article[] = articlesData.map(transformArticle);
  const categories: Category[] = categoriesData.map(transformCategory);
  const featuredAuthors = authorsData.map(transformAuthor);

  // Transform topCategories to strip _type and cross-fill
  const transformedTopCategories = topCategories.map((cat: any) => ({
    title: {
      sv: (typeof cat.title?.sv === 'string' && cat.title.sv) || (typeof cat.title?.en === 'string' && cat.title.en) || (typeof cat.title === 'string' ? cat.title : ''),
      en: (typeof cat.title?.en === 'string' && cat.title.en) || (typeof cat.title?.sv === 'string' && cat.title.sv) || (typeof cat.title === 'string' ? cat.title : ''),
    },
  }));

  // Transform footer categories
  const transformedFooterCategories = footerCategories.map((cat: any) => ({
    title: {
      sv: (typeof cat.title?.sv === 'string' && cat.title.sv) || (typeof cat.title?.en === 'string' && cat.title.en) || (typeof cat.title === 'string' ? cat.title : ''),
      en: (typeof cat.title?.en === 'string' && cat.title.en) || (typeof cat.title?.sv === 'string' && cat.title.sv) || (typeof cat.title === 'string' ? cat.title : ''),
    },
  }));

  return (
    <HomeClient
      articles={articles}
      categories={categories}
      heroArticles={heroArticles}
      featuredAuthors={featuredAuthors}
      topCategories={transformedTopCategories}
      siteSettings={siteSettings}
      topAuthors={topAuthors}
      footerCategories={transformedFooterCategories}
      footerAuthors={topAuthors}
    />
  );
}
