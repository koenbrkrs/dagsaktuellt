'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/articles/AllArticles.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocalizedString {
    sv: string;
    en: string;
}

interface Article {
    _id: string;
    title: LocalizedString;
    slug: string;
    publishedAt: string;
    mainImage?: any;
    imageUrl?: string;
    category?: LocalizedString;
    author?: string;
    excerpt?: LocalizedString;
}

interface Category {
    _id: string;
    title: LocalizedString;
}

interface AllArticlesClientProps {
    initialArticles: Article[];
    initialCategories: Category[];
}

export default function AllArticlesClient({ initialArticles, initialCategories }: AllArticlesClientProps) {
    const { language, t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter articles based on all criteria
    const filteredArticles = initialArticles.filter((article) => {
        // Search filter
        const title = article.title[language] || article.title.en || '';
        const excerpt = article.excerpt?.[language] || article.excerpt?.en || '';

        const matchesSearch =
            searchQuery === '' ||
            title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            excerpt.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const category = article.category?.[language] || article.category?.en || '';
        const matchesCategory =
            selectedCategories.length === 0 ||
            (category && selectedCategories.includes(category));

        // Date filter
        let matchesDate = true;
        if (dateFilter) {
            const articleDate = new Date(article.publishedAt);
            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24));

            if (dateFilter === 'today') matchesDate = daysDiff === 0;
            else if (dateFilter === 'week') matchesDate = daysDiff <= 7;
            else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
            else if (dateFilter === 'year') matchesDate = daysDiff <= 365;
        }

        return matchesSearch && matchesCategory && matchesDate;
    });

    // Toggle category selection
    const toggleCategory = (categoryTitle: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryTitle)
                ? prev.filter((c) => c !== categoryTitle)
                : [...prev, categoryTitle]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategories([]);
        setDateFilter('');
        setIsDropdownOpen(false);
    };

    return (
        <>
            <Header />
            <div className={styles.mainContainer}>
                {/* Sidebar with Filters */}
                <aside className={styles.sidebar}>
                    <div className={styles.filterSection}>
                        <div className={styles.filterHeader}>
                            <h2 className={styles.filterTitle}>{t('filters')}</h2>
                            <button onClick={clearFilters} className={styles.clearButton}>
                                {t('clearAll')}
                            </button>
                        </div>

                        {/* Search */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t('search')}</label>
                            <input
                                type="text"
                                className={styles.filterInput}
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Multi-Select Dropdown */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t('category')}</label>
                            <div className={styles.dropdownContainer}>
                                <div
                                    className={`${styles.dropdownToggle} ${isDropdownOpen ? styles.isOpen : ''}`}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span>
                                        {selectedCategories.length === 0
                                            ? t('allCategories')
                                            : `${selectedCategories.length} ${t('selected')}`}
                                    </span>
                                    <span className={styles.dropdownArrow}>▼</span>
                                </div>
                                {isDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        {initialCategories.map((category) => {
                                            const catTitle = category.title[language] || category.title.en;
                                            return (
                                                <div
                                                    key={category._id}
                                                    className={`${styles.dropdownItem} ${selectedCategories.includes(catTitle) ? styles.selected : ''
                                                        }`}
                                                    onClick={() => toggleCategory(catTitle)}
                                                >
                                                    <div className={styles.checkbox}>
                                                        <span className={styles.checkboxIcon}>✓</span>
                                                    </div>
                                                    <span>{catTitle}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t('published')}</label>
                            <select
                                className={styles.filterSelect}
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="">{t('allTime')}</option>
                                <option value="today">{t('today')}</option>
                                <option value="week">{t('lastWeek')}</option>
                                <option value="month">{t('lastMonth')}</option>
                                <option value="year">{t('lastYear')}</option>
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Articles Grid */}
                <main>
                    <div className={styles.articlesGrid}>
                        {filteredArticles.length === 0 ? (
                            <div className={styles.noResults}>
                                <h3>{t('noArticlesFound')}</h3>
                                <p>{t('tryAdjustingFilters')}</p>
                                <button onClick={clearFilters} className={styles.resetButton}>
                                    {t('resetFilters')}
                                </button>
                            </div>
                        ) : (
                            filteredArticles.map((article) => (
                                <Link
                                    key={article._id}
                                    href={`/articles/${article.slug}`}
                                    className={styles.articleCard}
                                    style={{ textDecoration: 'none' }}
                                >
                                    {article.imageUrl ? (
                                        <div
                                            className={styles.articleImage}
                                            style={{ backgroundImage: `url(${article.imageUrl})` }}
                                        />
                                    ) : (
                                        <div className={styles.articleImage} />
                                    )}
                                    <div className={styles.articleContent}>
                                        <div className={styles.articleTags}>
                                            {article.category && (
                                                <span className={styles.articleTag}>
                                                    {article.category[language] || article.category.en}
                                                </span>
                                            )}
                                            <span className={styles.articleDate}>
                                                {new Date(article.publishedAt).toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <h3 className={styles.articleTitle}>
                                            {article.title[language] || article.title.en}
                                        </h3>
                                        {article.excerpt && (
                                            <p className={styles.articleDescription}>
                                                {article.excerpt[language] || article.excerpt.en}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
