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

    return <ArticleClient post={post} />;
}