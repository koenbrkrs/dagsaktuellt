'use client';

import Link from 'next/link';
import styles from './RecentArticles.module.css';
import { Article } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface RecentArticlesProps {
    articles: Article[];
}

export default function RecentArticles({ articles }: RecentArticlesProps) {
    const { language, t } = useLanguage();

    // Only show first 4 articles
    const displayArticles = articles.slice(0, 4);

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('recentArticles')}</h2>
                <Link href="/articles" className={styles.browseBtn}>{t('viewAllArticles')}</Link>
            </div>
            <div className={styles.articlesGrid}>
                {displayArticles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.id}`}
                        className={styles.articleCard}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div className={styles.articleImage}></div>
                        <div className={styles.articleContent}>
                            <span className={styles.articleCategory}>{article.category}</span>
                            <h3 className={styles.articleTitle}>{article.title[language]}</h3>
                            <p className={styles.articleDescription}>{article.excerpt[language]}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
