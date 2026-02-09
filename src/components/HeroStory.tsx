'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './HeroStory.module.css';
import { Article } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroStoryProps {
    article: Article;
}

export default function HeroStory({ articles }: { articles: Article[] }) {
    const { language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (articles.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % articles.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [articles.length]);

    if (!articles || articles.length === 0) return null;
    const article = articles[currentIndex];

    return (
        <article
            className={styles.hero}
            style={{
                backgroundImage: article.image ? `url(${article.image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className={styles.content}>
                <div className={styles.categories}>
                    <span className={styles.category}>{article.category}</span>
                    <span className={styles.category}>{article.publishDate}</span>
                </div>
                <Link href={`/articles/${article.id}`}>
                    <h1 className={styles.headline}>{article.title[language]}</h1>
                </Link>
                <p className={styles.excerpt}>{article.excerpt[language]}</p>

                {articles.length > 1 && (
                    <div className={styles.carouselDots}>
                        {articles.map((_, index) => (
                            <span
                                key={index}
                                className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            ></span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
