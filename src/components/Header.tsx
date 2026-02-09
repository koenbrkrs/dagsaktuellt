'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiSun, FiMoon } from 'react-icons/fi';
import styles from './Header.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    // Detect scroll for header effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/articles');
        }
    };

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.headerContainer}`}>
                {/* Logo/Masthead */}
                <Link href="/" className={styles.masthead}>
                    <Image
                        src="/logo-white.png"
                        alt="Dagsaktuellt"
                        width={180}
                        height={45}
                        priority
                        className={styles.logo}
                    />
                </Link>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <Link href="/articles">{t('allArticles')}</Link>
                    <Link href="/about">{t('about')}</Link>
                    <Link href="/articles">{t('recent')}</Link>
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
                            <FiSearch />
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
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
