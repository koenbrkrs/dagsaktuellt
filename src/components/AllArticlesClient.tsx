'use client';

import { useState, useEffect } from 'react';
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
    initialAuthors?: string[];
    topCategories: { title: { sv: string; en: string } }[];
    footerCategories?: { title: { sv: string; en: string } }[];
    footerAuthors?: { name: string }[];
}

export default function AllArticlesClient({ initialArticles, initialCategories, initialAuthors = [], topCategories, footerCategories, footerAuthors }: AllArticlesClientProps) {
    const { language, t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Derive unique authors from articles
    const derivedAuthors = Array.from(
        new Set(initialArticles.map((a) => a.author).filter((a): a is string => !!a))
    ).sort();
    const allAuthors = initialAuthors.length > 0 ? initialAuthors : derivedAuthors;

    // Parse URL params for initial filters
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const categoryParam = params.get('category');
            const authorParam = params.get('author');

            if (categoryParam) {
                setSelectedCategories([categoryParam]);
            }
        }
    }, []);

    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);

    // Mutual exclusion: close other dropdowns when one opens
    const toggleCategoryDropdown = () => {
        setIsDropdownOpen((prev) => {
            if (!prev) setIsAuthorDropdownOpen(false);
            return !prev;
        });
    };

    const toggleAuthorDropdown = () => {
        setIsAuthorDropdownOpen((prev) => {
            if (!prev) setIsDropdownOpen(false);
            return !prev;
        });
    };

    // Parse URL params for initial filters
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const categoryParam = params.get('category');
            const authorParam = params.get('author');

            if (categoryParam) {
                setSelectedCategories([categoryParam]);
            }
            if (authorParam) {
                setSelectedAuthors([authorParam]);
            }
        }
    }, []);

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

        // Author filter
        const author = article.author || '';
        const matchesAuthor =
            selectedAuthors.length === 0 ||
            (author && selectedAuthors.includes(author));

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

        return matchesSearch && matchesCategory && matchesAuthor && matchesDate;
    });

    // Toggle category selection
    const toggleCategory = (categoryTitle: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryTitle)
                ? prev.filter((c) => c !== categoryTitle)
                : [...prev, categoryTitle]
        );
    };

    // Toggle author selection
    const toggleAuthor = (authorName: string) => {
        setSelectedAuthors((prev) =>
            prev.includes(authorName)
                ? prev.filter((a) => a !== authorName)
                : [...prev, authorName]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategories([]);
        setSelectedAuthors([]);
        setDateFilter('');
        setIsDropdownOpen(false);
        setIsAuthorDropdownOpen(false);
    };

    return (
        <>
            <Header topCategories={topCategories} solidHeader />
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
                                    onClick={toggleCategoryDropdown}
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
                                                        {selectedCategories.includes(catTitle) && <span className={styles.checkboxIcon}>✓</span>}
                                                    </div>
                                                    <span>{catTitle}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Author Multi-Select Dropdown */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t('author')}</label>
                            <div className={styles.dropdownContainer}>
                                <div
                                    className={`${styles.dropdownToggle} ${isAuthorDropdownOpen ? styles.isOpen : ''}`}
                                    onClick={toggleAuthorDropdown}
                                >
                                    <span>
                                        {selectedAuthors.length === 0
                                            ? t('allAuthors')
                                            : `${selectedAuthors.length} ${t('selected')}`}
                                    </span>
                                    <span className={styles.dropdownArrow}>▼</span>
                                </div>
                                {isAuthorDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        {allAuthors.map((authorName, index) => (
                                            <div
                                                key={index}
                                                className={`${styles.dropdownItem} ${selectedAuthors.includes(authorName) ? styles.selected : ''
                                                    }`}
                                                onClick={() => toggleAuthor(authorName)}
                                            >
                                                <div className={styles.checkbox}>
                                                    {selectedAuthors.includes(authorName) && <span className={styles.checkboxIcon}>✓</span>}
                                                </div>
                                                <span>{authorName}</span>
                                            </div>
                                        ))}
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
            <Footer topCategories={footerCategories} topAuthors={footerAuthors} />
        </>
    );
}
