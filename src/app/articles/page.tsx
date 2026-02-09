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
  "excerpt": body[0].children[0].text
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

    // Transform articles to include image URLs
    const transformedArticles = articles.map((article: any) => ({
        ...article,
        imageUrl: article.mainImage ? urlForImage(article.mainImage).width(800).height(480).url() : undefined,
    }));

    return (
        <AllArticlesClient
            initialArticles={transformedArticles}
            initialCategories={categories}
        />
    );
}