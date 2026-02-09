'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/articles');
        }
    };

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>
                {/* Logo/Masthead */}
                <Link href="/" className={styles.masthead}>
                    <h1 className="text-serif">Dagsaktuellt</h1>
                </Link>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <Link href="/articles">{t('allArticles')}</Link>
                    <Link href="/about">{t('about')}</Link>
                    <Link href="#recent">{t('recent')}</Link>
                </nav>

                {/* Search and Toggles */}
                <div className={styles.rightControls}>
                    {/* Search */}
                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={language === 'sv' ? 'Sök...' : 'Search...'}
                            className={styles.searchInput}
                        />
                        <button
                            type="submit"
                            className={styles.toggleButton}
                            aria-label="Search"
                        >
                            <span className={styles.icon}>🔍</span>
                        </button>
                    </form>

                    {/* Toggles */}
                    <div className={styles.toggles}>
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'sv' ? 'en' : 'sv')}
                            className={styles.toggleButton}
                            aria-label="Toggle language"
                        >
                            <span className={styles.flag}>{language === 'sv' ? '🇬🇧' : '🇸🇪'}</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={styles.toggleButton}
                            aria-label="Toggle theme"
                        >
                            <span className={styles.icon}>{theme === 'light' ? '🌙' : '☀️'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
