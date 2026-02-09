'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './CategoryBar.module.css';
import { Category } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryBarProps {
    categories: Category[];
    activeCategory: string | null;
    onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryBar({ categories, activeCategory, onCategoryChange }: CategoryBarProps) {
    const { language, t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Calculate total number of slides (3 categories per slide)
    const categoriesPerSlide = 3;
    const totalSlides = Math.ceil(categories.length / categoriesPerSlide);

    // Get current categories to display
    const getCurrentCategories = () => {
        const start = currentIndex * categoriesPerSlide;
        const end = start + categoriesPerSlide;
        return categories.slice(start, end);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const currentCategories = getCurrentCategories();

    return (
        <div className={styles.categorySection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('categories')}</h2>
                <Link href="/articles" className={styles.browseBtn}>{t('viewAllArticles')}</Link>
            </div>

            <div className={styles.carouselWrapper}>
                <div className={styles.categoriesGrid}>
                    {currentCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/articles?category=${category.id}`}
                            className={styles.categoryCard}
                            style={{
                                textDecoration: 'none',
                                backgroundImage: category.image ? `url(${category.image})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <h3>{category.name[language]}</h3>
                            <p>{category.description?.[language] || 'Things happening in the world right now'}</p>
                        </Link>
                    ))}
                </div>

                {/* Navigation Arrow - only show if more than one slide */}
                {totalSlides > 1 && (
                    <button
                        className={styles.navArrow}
                        onClick={nextSlide}
                        aria-label="Next categories"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation Dots - only show if more than one slide */}
            {totalSlides > 1 && (
                <div className={styles.carouselDots}>
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <span
                            key={index}
                            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                            onClick={() => goToSlide(index)}
                        ></span>
                    ))}
                </div>
            )}
        </div>
    );
}
