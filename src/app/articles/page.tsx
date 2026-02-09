'use client';

import { useState, useRef, useEffect, Suspense } from 'react'; // Added Suspense
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

// 1. We move the logic into a separate internal component
function ArticlesContent() {
    const { language } = useLanguage();
    const searchParams = useSearchParams();

    const articles = articlesData as Article[];
    const categories = categoriesData as Category[];

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');
        if (categoryParam) setSelectedCategories([categoryParam]);
        if (searchParam) setSearchQuery(searchParam);
    }, [searchParams]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const uniqueAuthors = Array.from(new Set(articles.map(a => a.author)));

    const filteredArticles = articles.filter(article => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            if (!article.title[language].toLowerCase().includes(query) &&
                !article.excerpt[language].toLowerCase().includes(query)) return false;
        }
        if (selectedCategories.length > 0 && !selectedCategories.includes(article.category)) return false;
        if (selectedAuthor && article.author !== selectedAuthor) return false;
        if (startDate && new Date(article.publishDate) < new Date(startDate)) return false;
        if (endDate) {
            const endInclusive = new Date(endDate);
            endInclusive.setDate(endInclusive.getDate() + 1);
            if (new Date(article.publishDate) >= endInclusive) return false;
        }
        return true;
    }).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedAuthor(null);
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
    };

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name[language] || id;

    const getCategoryPlaceholder = () => {
        if (selectedCategories.length === 0) return language === 'sv' ? 'Välj kategorier...' : 'Select categories...';
        if (selectedCategories.length === 1) return getCategoryName(selectedCategories[0]);
        return language === 'sv' ? `${selectedCategories.length} valda` : `${selectedCategories.length} selected`;
    };

    return (
        <div className={styles.mainContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.filterSection}>
                    <h3 className={styles.filterTitle}>{language === 'sv' ? 'Filtrera Artiklar' : 'Filter Articles'}</h3>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>{language === 'sv' ? 'Sök' : 'Search'}</label>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={language === 'sv' ? 'Sök artiklar...' : 'Search articles...'} className={styles.filterInput} />
                    </div>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>{language === 'sv' ? 'Kategorier' : 'Categories'}</label>
                        <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
                            <div className={`${styles.dropdownToggle} ${isCategoryDropdownOpen ? styles.isOpen : ''}`} onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
                                <span>{getCategoryPlaceholder()}</span>
                                <span className={styles.dropdownArrow}>▼</span>
                            </div>
                            {isCategoryDropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    {categories.map((cat) => (
                                        <div key={cat.id} className={`${styles.dropdownItem} ${selectedCategories.includes(cat.id) ? styles.selected : ''}`} onClick={() => toggleCategory(cat.id)}>
                                            <div className={styles.checkbox}><span className={styles.checkboxIcon}>✓</span></div>
                                            <span>{cat.name[language]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>{language === 'sv' ? 'Författare' : 'Author'}</label>
                        <select value={selectedAuthor || ''} onChange={(e) => setSelectedAuthor(e.target.value || null)} className={styles.filterSelect}>
                            <option value="">{language === 'sv' ? 'Alla författare' : 'All Authors'}</option>
                            {uniqueAuthors.map(auth => <option key={auth} value={auth}>{auth}</option>)}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>{language === 'sv' ? 'Datum' : 'Date'}</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={styles.filterInput} />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.filterInput} />
                    </div>
                    <button onClick={clearFilters} className={styles.clearButton}>{language === 'sv' ? 'Rensa alla filter' : 'Clear all filters'}</button>
                </div>
            </aside>

            <main>
                <div className={styles.articlesGrid}>
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                            <Link href={`/article/${article.id}`} key={article.id} style={{ textDecoration: 'none' }}>
                                <article className={styles.articleCard}>
                                    <div className={styles.articleImage}></div>
                                    <div className={styles.articleContent}>
                                        <div className={styles.articleTags}>
                                            <span className={styles.articleTag}>{getCategoryName(article.category)}</span>
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
                            <p>{language === 'sv' ? 'Inga artiklar hittades.' : 'No articles found.'}</p>
                            <button onClick={clearFilters} className={styles.resetButton}>{language === 'sv' ? 'Visa alla' : 'Show all'}</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// 2. The Main Page wraps the content in Suspense to fix the Build Error
export default function AllArticlesPage() {
    return (
        <>
            <Header />
            <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>Laddar tidningsarkivet...</div>}>
                <ArticlesContent />
            </Suspense>
            <Footer />
        </>
    );
}