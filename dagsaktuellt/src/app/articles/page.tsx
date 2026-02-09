'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './AllArticles.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

// Data
import articlesData from '@/data/articles.json';
import categoriesData from '@/data/categories.json';
import { Article, Category } from '@/types';

export default function AllArticlesPage() {
    const { language, t } = useLanguage();
    const searchParams = useSearchParams();

    const articles = articlesData as Article[];
    const categories = categoriesData as Category[];

    // State for filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // UI State
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // Apply category and search filters from URL on mount
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');

        if (categoryParam) {
            setSelectedCategories([categoryParam]);
        }
        if (searchParam) {
            setSearchQuery(searchParam);
        }
    }, [searchParams]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Extract unique authors
    const uniqueAuthors = Array.from(new Set(articles.map(a => a.author)));

    // Filter and sort articles
    const filteredArticles = articles.filter(article => {
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const titleMatch = article.title[language].toLowerCase().includes(query);
            const excerptMatch = article.excerpt[language].toLowerCase().includes(query);
            if (!titleMatch && !excerptMatch) return false;
        }

        // Category filter (Multi-select)
        if (selectedCategories.length > 0) {
            if (!selectedCategories.includes(article.category)) return false;
        }

        // Author filter
        if (selectedAuthor && article.author !== selectedAuthor) return false;

        // Date filter
        if (startDate) {
            const articleDate = new Date(article.publishDate);
            const start = new Date(startDate);
            if (articleDate < start) return false;
        }
        if (endDate) {
            const articleDate = new Date(article.publishDate);
            const end = new Date(endDate);
            // Add one day to end date to make it inclusive
            const endInclusive = new Date(end);
            endInclusive.setDate(endInclusive.getDate() + 1);
            if (articleDate >= endInclusive) return false;
        }

        return true;
    }).sort((a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedAuthor(null);
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
    };

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name[language] || id;

    // Helper text for category dropdown
    const getCategoryPlaceholder = () => {
        if (selectedCategories.length === 0) return language === 'sv' ? 'Välj kategorier...' : 'Select categories...';
        if (selectedCategories.length === 1) return getCategoryName(selectedCategories[0]);
        return language === 'sv' ? `${selectedCategories.length} valda` : `${selectedCategories.length} selected`;
    };

    return (
        <>
            <Header />

            <div className={styles.mainContainer}>
                <aside className={styles.sidebar}>
                    <div className={styles.filterSection}>
                        <div className={styles.filterHeader}>
                            <h3 className={styles.filterTitle}>{language === 'sv' ? 'Filtrera Artiklar' : 'Filter Articles'}</h3>
                        </div>

                        {/* Search Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{language === 'sv' ? 'Sök' : 'Search'}</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={language === 'sv' ? 'Sök artiklar...' : 'Search articles...'}
                                className={styles.filterInput}
                            />
                        </div>

                        {/* Category Filter - Multi-select Dropdown */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{language === 'sv' ? 'Kategorier' : 'Categories'}</label>
                            <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
                                <div
                                    className={`${styles.dropdownToggle} ${isCategoryDropdownOpen ? styles.isOpen : ''}`}
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                >
                                    <span>{getCategoryPlaceholder()}</span>
                                    <span className={styles.dropdownArrow}>▼</span>
                                </div>

                                {isCategoryDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        {categories.map((cat) => {
                                            const isSelected = selectedCategories.includes(cat.id);
                                            return (
                                                <div
                                                    key={cat.id}
                                                    className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                                                    onClick={() => toggleCategory(cat.id)}
                                                >
                                                    <div className={styles.checkbox}>
                                                        <span className={styles.checkboxIcon}>✓</span>
                                                    </div>
                                                    <span>{cat.name[language]}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Author Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{language === 'sv' ? 'Författare' : 'Author'}</label>
                            <select
                                value={selectedAuthor || ''}
                                onChange={(e) => setSelectedAuthor(e.target.value || null)}
                                className={styles.filterSelect}
                            >
                                <option value="">{language === 'sv' ? 'Alla författare' : 'All Authors'}</option>
                                {uniqueAuthors.map(auth => (
                                    <option key={auth} value={auth}>{auth}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{language === 'sv' ? 'Datum' : 'Date'}</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={styles.filterInput}
                                placeholder="From"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={styles.filterInput}
                                placeholder="To"
                            />
                        </div>

                        <button onClick={clearFilters} className={styles.clearButton}>
                            {language === 'sv' ? 'Rensa alla filter' : 'Clear all filters'}
                        </button>
                    </div>
                </aside>

                <main>
                    <div className={styles.articlesGrid}>
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map((article) => (
                                <Link
                                    href={`/article/${article.id}`}
                                    key={article.id}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <article className={styles.articleCard}>
                                        <div className={styles.articleImage}></div>
                                        <div className={styles.articleContent}>
                                            <div className={styles.articleTags}>
                                                <span className={styles.articleTag}>
                                                    {categories.find(c => c.id === article.category)?.name[language] || article.category}
                                                </span>
                                                <span className={styles.articleDate}>{article.publishDate}</span>
                                            </div>
                                            <h3 className={styles.articleTitle}>{article.title[language]}</h3>
                                            <p className={styles.articleDescription}>{article.excerpt[language]}</p>
                                        </div>
                                    </article>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                <p>{language === 'sv' ? 'Inga artiklar hittades med valda filter.' : 'No articles found with selected filters.'}</p>
                                <button onClick={clearFilters} className={styles.resetButton}>
                                    {language === 'sv' ? 'Visa alla artiklar' : 'Show all articles'}
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}
