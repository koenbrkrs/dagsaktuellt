import { PortableText, type PortableTextComponents } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import { notFound } from 'next/navigation';
import { FiCalendar, FiClock, FiBookmark } from 'react-icons/fi';
import styles from './Article.module.css';

// Added Header and Footer imports
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

const components: PortableTextComponents = {
    types: {
        image: ({ value }: any) => {
            if (!value?.asset?._ref) {
                return null;
            }
            return (
                <div>
                    <img
                        src={urlForImage(value)
                            .width(800)
                            .fit('max')
                            .auto('format')
                            .url()}
                        alt={value.alt || 'Article Image'}
                        className={styles.articleImage}
                    />
                    {value.caption && (
                        <p className={styles.imageCaption}>
                            {value.caption}
                        </p>
                    )}
                </div>
            );
        },
    },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await client.fetch(query, { slug });

    if (!post) {
        notFound();
    }

    const heroImageUrl = post.mainImage
        ? urlForImage(post.mainImage).width(1920).height(1080).url()
        : '';

    const authorImageUrl = post.author?.image
        ? urlForImage(post.author.image).width(160).height(160).url()
        : '';

    return (
        <>
            <Header />
            <article className={styles.articleContainer}>
                {/* Hero Section */}
                <div
                    className={styles.hero}
                    style={{
                        backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className={styles.content}>
                        <div className={styles.categories}>
                            {post.category && (
                                <span className={styles.category}>{post.category}</span>
                            )}
                            <span className={styles.category}>
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <h1 className={styles.headline}>{post.title}</h1>
                    </div>
                </div>

                {/* Article Meta Buttons */}
                <div className={styles.articleMeta}>
                    <button className={styles.metaBtn}>
                        <FiCalendar /> {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </button>
                    <button className={styles.metaBtn}><FiClock /> 5 min read</button>
                    <button className={styles.metaBtn}><FiBookmark /> Save</button>
                </div>

                {/* Author Spotlight */}
                {post.author && (
                    <div className={styles.authorSpotlight}>
                        {/* Author Image */}
                        {authorImageUrl ? (
                            <img
                                src={authorImageUrl}
                                alt={post.author.name}
                                className={styles.authorSpotlightImage}
                            />
                        ) : (
                            <div className={styles.authorPlaceholder} />
                        )}

                        {/* Author Text Info */}
                        <div className={styles.authorInfo}>
                            <span className={styles.authorName}>{post.author.name}</span>
                            {post.author.jobTitle && (
                                <span className={styles.authorJob}>{post.author.jobTitle}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Article Content */}
                <div className={styles.content}>
                    <PortableText value={post.body} components={components} />
                </div>
            </article>
            <Footer />
        </>
    );
}