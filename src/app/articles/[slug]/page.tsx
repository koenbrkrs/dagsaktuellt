import { client } from '@/sanity/lib/client';
import { notFound } from 'next/navigation';
import ArticleClient from '@/components/ArticleClient';

export const revalidate = 60;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const query = `*[_type == "post"]{ "slug": slug.current }`;
  const slugs = await client.fetch(query);

  return slugs.map((item: any) => ({
    slug: item.slug,
  }));
}

const query = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  publishedAt,
  mainImage,
  author->{
    name,
    image,
    jobTitle
  },
  "category": categories[0]->title,
  body
}`;

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch(query, { slug });

  if (!post) {
    notFound();
  }

  // Helper to extract first text from body (same as in Home)
  const extractExcerpt = (body: any): { sv: string; en: string } => {
    const svText = body?.sv?.[0]?.children?.[0]?.text || '';
    const enText = body?.en?.[0]?.children?.[0]?.text || '';
    const fallbackText = body?.[0]?.children?.[0]?.text || '';

    return {
      sv: svText || fallbackText,
      en: enText || fallbackText,
    };
  };

  const postWithExcerpt = {
    ...post,
    excerpt: extractExcerpt(post.body),
  };

  // Fetch top categories for header
  // Fetch top categories for header and footer data
  const topCategoriesQuery = `*[_type == "category" && displayInHeader == true]{title}`;
  const siteSettingsQuery = `*[_type == "siteSettings"][0]`;
  const topAuthorsQuery = `*[_type == "author"]|order(count(*[_type == "post" && references(^._id)]) desc)[0...4]{name}`;

  const footerCategoriesQuery = `*[_type == "category"]{
    title,
    "articleCount": count(*[_type == "post" && references(^._id)])
  } | order(articleCount desc)[0...4]`;

  const [rawTopCategories, siteSettings, topAuthors, rawFooterCats] = await Promise.all([
    client.fetch(topCategoriesQuery),
    client.fetch(siteSettingsQuery),
    client.fetch(topAuthorsQuery),
    client.fetch(footerCategoriesQuery),
  ]);
  const topCategories = rawTopCategories.map((cat: any) => ({
    title: {
      sv: (typeof cat.title?.sv === 'string' && cat.title.sv) || (typeof cat.title?.en === 'string' && cat.title.en) || (typeof cat.title === 'string' ? cat.title : ''),
      en: (typeof cat.title?.en === 'string' && cat.title.en) || (typeof cat.title?.sv === 'string' && cat.title.sv) || (typeof cat.title === 'string' ? cat.title : ''),
    },
  }));
  const footerCategories = rawFooterCats.map((cat: any) => ({
    title: {
      sv: (typeof cat.title?.sv === 'string' && cat.title.sv) || (typeof cat.title?.en === 'string' && cat.title.en) || (typeof cat.title === 'string' ? cat.title : ''),
      en: (typeof cat.title?.en === 'string' && cat.title.en) || (typeof cat.title?.sv === 'string' && cat.title.sv) || (typeof cat.title === 'string' ? cat.title : ''),
    },
  }));

  return <ArticleClient post={postWithExcerpt} topCategories={topCategories} siteSettings={siteSettings} topAuthors={topAuthors} footerCategories={footerCategories} footerAuthors={topAuthors} />;
}