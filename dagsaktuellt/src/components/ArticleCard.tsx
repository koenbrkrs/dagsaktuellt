'use client';

import Link from 'next/link';
import styles from './ArticleCard.module.css';
import { Article } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArticleCardProps {
    article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const { language } = useLanguage();

    return (
        <article className={styles.card}>
            <Link href={`/article/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.imageContainer}></div>
                <div className={styles.content}>
                    <span className={styles.category}>{article.category}</span>
                    <h3 className={styles.headline}>{article.title[language]}</h3>
                    <p className={styles.excerpt}>{article.excerpt[language]}</p>
                </div>
            </Link>
        </article>
    );
}
