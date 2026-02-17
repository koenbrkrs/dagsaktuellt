'use client';

import { PortableText, type PortableTextComponents } from 'next-sanity';
import { urlForImage } from '@/sanity/lib/image';
import { FiCalendar, FiClock, FiBookmark } from 'react-icons/fi';
import styles from '@/app/articles/[slug]/Article.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArticleClientProps {
    post: {
        _id: string;
        title: { sv: string; en: string };
        publishedAt: string;
        mainImage: any;
        author: {
            name: string;
            image: any;
            jobTitle: { sv: string; en: string };
        };
        category: { sv: string; en: string };
        body: { sv: any[]; en: any[] };
        excerpt: { sv: string; en: string };
    };
    topCategories?: { title: { sv: string; en: string } }[];
    siteSettings?: any;
    topAuthors?: any;
    footerCategories?: { title: { sv: string; en: string } }[];
    footerAuthors?: { name: string }[];
}

const components: PortableTextComponents = {
    types: {
        image: ({ value }: any) => {
            if (!value?.asset?._ref) {
                return null;
            }
            return (
                <div className={styles.imageContainer}>
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

export default function ArticleClient({ post, topCategories, siteSettings, topAuthors, footerCategories, footerAuthors }: ArticleClientProps) {
    const { language, t } = useLanguage();

    const heroImageUrl = post.mainImage
        ? urlForImage(post.mainImage).width(1920).height(1080).url()
        : '';

    const authorImageUrl = post.author?.image
        ? urlForImage(post.author.image).width(160).height(160).url()
        : '';

    // Fallbacks for content
    const title = post.title?.[language] || post.title?.en || '';
    const category = post.category?.[language] || post.category?.en || '';
    const body = post.body?.[language] || post.body?.en || [];
    const jobTitle = post.author?.jobTitle?.[language] || post.author?.jobTitle?.en || '';
    const excerpt = post.excerpt?.[language] || post.excerpt?.en || '';

    // Date formatting
    const formattedDate = new Date(post.publishedAt).toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <>
            <Header topCategories={topCategories} />
            <article className={styles.articleContainer}>
                {/* Hero Section */}
                <div className={styles.hero}>
                    {heroImageUrl && (
                        <img
                            src={heroImageUrl}
                            alt={title}
                            className={styles.heroImage}
                        />
                    )}
                    <div className={styles.content}>
                        <div className={styles.categories}>
                            {category && (
                                <span className={styles.category}>{category}</span>
                            )}
                            <span className={styles.category}>
                                {formattedDate}
                            </span>
                        </div>
                        <h1 className={styles.headline}>{title}</h1>
                        {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
                    </div>
                </div>

                {/* Article Meta Buttons */}
                <div className={styles.articleMeta}>
                    <button className={styles.metaBtn}>
                        <FiCalendar /> {formattedDate}
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
                            <div className={styles.authorLabel}>{t('by')}</div>
                            <span className={styles.authorName}>{post.author.name}</span>
                            {jobTitle && (
                                <span className={styles.authorJob}>{jobTitle}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Article Content */}
                <div className={styles.content}>
                    <PortableText value={body} components={components} />
                </div>
            </article>
            <Footer topCategories={footerCategories} topAuthors={footerAuthors} />
        </>
    );
}
