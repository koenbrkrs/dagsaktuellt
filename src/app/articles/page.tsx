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

// Safely extract {sv, en} from a value that may be a plain string,
// a localized object {_type, sv, en}, or undefined.
// If one language is empty, cross-fill from the other.
function localizedStr(val: any): { sv: string; en: string } {
    if (val == null) return { sv: '', en: '' };
    if (typeof val === 'string') return { sv: val, en: val };
    // It's an object — extract sv/en, ignoring _type
    const sv = typeof val.sv === 'string' ? val.sv : '';
    const en = typeof val.en === 'string' ? val.en : '';
    // Cross-fill: if one language is empty, use the other
    return { sv: sv || en, en: en || sv };
}

// Safely extract a plain string from a value that may be a localized object
function plainStr(val: any): string {
    if (val == null) return '';
    if (typeof val === 'string') return val;
    // Localized object — prefer en, fallback to sv
    if (typeof val.en === 'string' && val.en) return val.en;
    if (typeof val.sv === 'string' && val.sv) return val.sv;
    return '';
}

export default async function ArticlesPage() {
    // Fetch both articles and categories in parallel
    const [articles, categories] = await Promise.all([
        client.fetch(articlesQuery),
        client.fetch(categoriesQuery),
    ]);

    // Fetch top categories for header
    const topCategoriesQuery = `*[_type == "category" && displayInHeader == true]{title}`;
    const rawTopCategories = await client.fetch(topCategoriesQuery);
    const topCategories = rawTopCategories.map((cat: any) => ({
        title: localizedStr(cat.title),
    }));

    // Fetch footer data: top 4 categories by article count, top 4 authors by article count
    const footerCategoriesQuery = `*[_type == "category"]{
        title,
        "articleCount": count(*[_type == "post" && references(^._id)])
    } | order(articleCount desc)[0...4]`;
    const topAuthorsQuery = `*[_type == "author"]|order(count(*[_type == "post" && references(^._id)]) desc)[0...4]{name}`;
    const [rawFooterCats, footerAuthors] = await Promise.all([
        client.fetch(footerCategoriesQuery),
        client.fetch(topAuthorsQuery),
    ]);
    const footerCategories = rawFooterCats.map((cat: any) => ({
        title: localizedStr(cat.title),
    }));

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
        title: localizedStr(article.title),
        slug: article.slug,
        publishedAt: article.publishedAt,
        imageUrl: article.mainImage ? urlForImage(article.mainImage).width(800).height(480).url() : undefined,
        category: localizedStr(article.category),
        author: plainStr(article.author),
        excerpt: extractExcerpt(article.excerpt),
    }));

    // Transform categories
    const transformedCategories = categories.map((cat: any) => ({
        _id: cat._id,
        title: localizedStr(cat.title),
    }));

    return (
        <AllArticlesClient
            initialArticles={transformedArticles}
            initialCategories={transformedCategories}
            topCategories={topCategories}
            footerCategories={footerCategories}
            footerAuthors={footerAuthors}
        />
    );
}