'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './HeroStory.module.css';
import { Article } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HeroStory({ articles }: { articles: Article[] }) {
    const { language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fading, setFading] = useState(false);
    const pendingIndex = useRef<number | null>(null);
    const router = useRouter();

    // Transition to a new slide with a fade
    const goToSlide = useCallback((nextIndex: number) => {
        if (fading || nextIndex === currentIndex) return;
        pendingIndex.current = nextIndex;
        setFading(true);
        // After fade-out (500ms), switch content
        setTimeout(() => {
            setCurrentIndex(pendingIndex.current!);
            pendingIndex.current = null;
            setFading(false);
            // Fade-in happens via CSS transition
        }, 500);
    }, [fading, currentIndex]);

    // Auto-advance
    useEffect(() => {
        if (articles.length <= 1) return;
        const interval = setInterval(() => {
            const next = (pendingIndex.current ?? currentIndex + 1) % articles.length;
            goToSlide(next === currentIndex ? (currentIndex + 1) % articles.length : next);
        }, 8000);
        return () => clearInterval(interval);
    }, [articles.length, currentIndex, goToSlide]);

    if (!articles || articles.length === 0) return null;
    const article = articles[currentIndex];

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        goToSlide((currentIndex + 1) % articles.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        goToSlide((currentIndex - 1 + articles.length) % articles.length);
    };

    const handleHeroClick = () => {
        router.push(`/articles/${article.id}`);
    };

    return (
        <article className={styles.hero} onClick={handleHeroClick}>
            {article.image && (
                <img
                    src={article.image}
                    alt={article.title[language]}
                    className={`${styles.heroImage} ${fading ? styles.fadeOut : styles.fadeIn}`}
                />
            )}

            {articles.length > 1 && (
                <>
                    <div className={styles.navZoneLeft} onClick={prevSlide} title="Previous article">
                        <span className={styles.navArrow}>&#8249;</span>
                    </div>
                    <div className={styles.navZoneRight} onClick={nextSlide} title="Next article">
                        <span className={styles.navArrow}>&#8250;</span>
                    </div>
                </>
            )}

            <div className={`${styles.content} ${fading ? styles.fadeOut : styles.fadeIn}`}>
                <div className={styles.categories}>
                    <span className={styles.category}>{article.category[language]}</span>
                    <span className={styles.category}>{article.publishDate}</span>
                </div>
                <h1 className={styles.headline}>{article.title[language]}</h1>
                <p className={styles.excerpt}>{article.excerpt[language]}</p>

                {articles.length > 1 && (
                    <div className={styles.carouselDots}>
                        {articles.map((_, index) => (
                            <span
                                key={index}
                                className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToSlide(index);
                                }}
                            ></span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
