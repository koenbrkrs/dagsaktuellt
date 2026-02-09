'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/articles/AllArticles.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Article {
    _id: string;
    title: string;
    slug: string;
    publishedAt: string;
    mainImage?: any;
    imageUrl?: string;
    category?: string;
    author?: string;
    excerpt?: string;
}

interface Category {
    _id: string;
    title: string;
}

interface AllArticlesClientProps {
    initialArticles: Article[];
    initialCategories: Category[];
}

export default function AllArticlesClient({ initialArticles, initialCategories }: AllArticlesClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter articles based on all criteria
    const filteredArticles = initialArticles.filter((article) => {
        // Search filter
        const matchesSearch =
            searchQuery === '' ||
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory =
            selectedCategories.length === 0 ||
            (article.category && selectedCategories.includes(article.category));

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
                            <h2 className={styles.filterTitle}>Filters</h2>
                            <button onClick={clearFilters} className={styles.clearButton}>
                                Clear All
                            </button>
                        </div>

                        {/* Search */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Search</label>
                            <input
                                type="text"
                                className={styles.filterInput}
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Multi-Select Dropdown */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Category</label>
                            <div className={styles.dropdownContainer}>
                                <div
                                    className={`${styles.dropdownToggle} ${isDropdownOpen ? styles.isOpen : ''}`}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span>
                                        {selectedCategories.length === 0
                                            ? 'All Categories'
                                            : `${selectedCategories.length} selected`}
                                    </span>
                                    <span className={styles.dropdownArrow}>▼</span>
                                </div>
                                {isDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        {initialCategories.map((category) => (
                                            <div
                                                key={category._id}
                                                className={`${styles.dropdownItem} ${selectedCategories.includes(category.title) ? styles.selected : ''
                                                    }`}
                                                onClick={() => toggleCategory(category.title)}
                                            >
                                                <div className={styles.checkbox}>
                                                    <span className={styles.checkboxIcon}>✓</span>
                                                </div>
                                                <span>{category.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Published</label>
                            <select
                                className={styles.filterSelect}
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="year">Last Year</option>
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Articles Grid */}
                <main>
                    <div className={styles.articlesGrid}>
                        {filteredArticles.length === 0 ? (
                            <div className={styles.noResults}>
                                <h3>No articles found</h3>
                                <p>Try adjusting your filters</p>
                                <button onClick={clearFilters} className={styles.resetButton}>
                                    Reset Filters
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
                                                <span className={styles.articleTag}>{article.category}</span>
                                            )}
                                            <span className={styles.articleDate}>
                                                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <h3 className={styles.articleTitle}>{article.title}</h3>
                                        {article.excerpt && (
                                            <p className={styles.articleDescription}>{article.excerpt}</p>
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
