import { client } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import AllArticlesClient from '@/components/AllArticlesClient';

export const revalidate = 60;

// GROQ query for all articles with complete data
const articlesQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  mainImage,
  "category": categories[0]->title,
  "author": author->name,
  "excerpt": body
}`;

// GROQ query for all categories
const categoriesQuery = `*[_type == "category"] {
  _id,
  title
}`;

export default async function ArticlesPage() {
    // Fetch both articles and categories in parallel
    const [articles, categories] = await Promise.all([
        client.fetch(articlesQuery),
        client.fetch(categoriesQuery),
    ]);

    // Helper to extract excerpt
    const extractExcerpt = (body: any) => {
        const svText = body?.sv?.[0]?.children?.[0]?.text || '';
        const enText = body?.en?.[0]?.children?.[0]?.text || '';
        const fallbackText = body?.[0]?.children?.[0]?.text || '';
        return {
            sv: svText || fallbackText,
            en: enText || fallbackText,
        };
    };

    // Transform articles to include image URLs and localized fields
    const transformedArticles = articles.map((article: any) => ({
        _id: article._id,
        title: {
            sv: article.title?.sv || article.title || '',
            en: article.title?.en || article.title || '',
        },
        slug: article.slug,
        publishedAt: article.publishedAt,
        imageUrl: article.mainImage ? urlForImage(article.mainImage).width(800).height(480).url() : undefined,
        category: {
            sv: article.category?.sv || article.category || '',
            en: article.category?.en || article.category || '',
        },
        author: article.author || '',
        excerpt: extractExcerpt(article.excerpt),
    }));

    // Transform categories
    const transformedCategories = categories.map((cat: any) => ({
        _id: cat._id,
        title: {
            sv: cat.title?.sv || cat.title || '',
            en: cat.title?.en || cat.title || '',
        },
    }));

    return (
        <AllArticlesClient
            initialArticles={transformedArticles}
            initialCategories={transformedCategories}
        />
    );
}