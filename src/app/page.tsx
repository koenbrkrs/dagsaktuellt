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

export default async function Home() {
  // Fetch all data in parallel
  const [heroData, articlesData, categoriesData, authorsData] = await Promise.all([
    client.fetch(heroQuery),
    client.fetch(articlesQuery),
    client.fetch(categoriesQuery),
    client.fetch(authorsQuery),
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

  // Transform Sanity data to match Article type
  const transformArticle = (post: any): Article => ({
    id: post.slug?.current || post._id,
    title: {
      sv: post.title?.sv || post.title || '',
      en: post.title?.en || post.title || '',
    },
    excerpt: extractExcerpt(post.excerpt),
    content: {
      sv: '',
      en: '',
    },
    category: {
      sv: post.category?.sv || post.category?.en || post.category || 'Okategoriserad',
      en: post.category?.en || post.category?.sv || post.category || 'Uncategorized',
    },
    author: post.authorName || 'Unknown',
    publishDate: new Date(post.publishedAt).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    featured: false,
    image: post.mainImage ? urlForImage(post.mainImage).width(800).height(450).url() : undefined,
  });

  // Transform Sanity categories to match Category type
  const transformCategory = (cat: any): Category => ({
    id: cat._id,
    name: {
      sv: cat.title?.sv || cat.title || '',
      en: cat.title?.en || cat.title || '',
    },
    description: {
      sv: cat.description?.sv || cat.description || '',
      en: cat.description?.en || cat.description || '',
    },
    image: cat.image ? urlForImage(cat.image).width(800).height(400).url() : undefined,
  });

  // Transform authors and calculate top categories
  const transformAuthor = (author: any) => {
    // Flatten all categories from author's posts
    const allCategories = author.posts?.flatMap((post: any) => {
      // Handle both localized and non-localized categories
      return post.categories?.map((cat: any) => cat?.sv || cat?.en || cat || '') || [];
    }) || [];

    // Count category occurrences
    const categoryCount: { [key: string]: number } = {};
    allCategories.forEach((cat: string) => {
      if (cat) {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
    });

    // Sort by frequency and get top 5
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

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

  return (
    <HomeClient
      articles={articles}
      categories={categories}
      heroArticles={heroArticles}
      featuredAuthors={featuredAuthors}
    />
  );
}
