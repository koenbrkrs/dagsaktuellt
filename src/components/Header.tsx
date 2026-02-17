'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import styles from './Header.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
    topCategories?: { title: { sv: string; en: string } }[];
    solidHeader?: boolean;
}

export default function Header({ topCategories = [], solidHeader = false }: HeaderProps) {
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

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
        <header className={`${styles.header} ${(isScrolled || solidHeader) ? styles.scrolled : ''}`}>
            <div className={`container ${styles.headerContainer}`}>
                {/* Logo/Masthead */}
                <Link href="/" className={styles.masthead}>
                    <Image
                        src={(theme === 'light' && (isScrolled || solidHeader)) ? '/logo-black.png' : '/logo-white.png'}
                        alt="Dagsaktuellt"
                        width={120}
                        height={25}
                        priority
                        className={styles.logo}
                    />
                </Link>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <Link href="/articles">{t('allArticles')}</Link>
                    <Link href="/about">{t('about')}</Link>
                    <Link href="/articles">{t('recent')}</Link>
                    {topCategories.map((cat, index) => (
                        <Link
                            key={index}
                            href={`/articles?category=${encodeURIComponent(cat.title[language] || cat.title.en)}`}
                        >
                            {cat.title[language] || cat.title.en}
                        </Link>
                    ))}
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

                {/* Mobile Menu Button */}
                <button
                    className={styles.mobileMenuBtn}
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <FiMenu />
                </button>
            </div>

            {/* Sidebar Overlay */}
            <div
                className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.open : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                {/* Sidebar Header with Close Button */}
                <div className={styles.sidebarHeader}>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <FiX />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className={styles.sidebarNav}>
                    <Link href="/articles" onClick={() => setSidebarOpen(false)}>
                        {t('allArticles')}
                    </Link>
                    <Link href="/about" onClick={() => setSidebarOpen(false)}>
                        {t('about')}
                    </Link>
                    <Link href="/articles" onClick={() => setSidebarOpen(false)}>
                        {t('recent')}
                    </Link>
                </nav>

                {/* Sidebar Actions */}
                <div className={styles.sidebarActions}>
                    {/* Search */}
                    <form onSubmit={handleSearch} className={styles.sidebarSearchForm}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={language === 'sv' ? 'Sök...' : 'Search...'}
                            className={styles.sidebarSearchInput}
                        />
                        <button
                            type="submit"
                            className={styles.sidebarSearchBtn}
                            aria-label="Search"
                        >
                            <FiSearch />
                        </button>
                    </form>

                    {/* Toggles */}
                    <div className={styles.sidebarToggles}>
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'sv' ? 'en' : 'sv')}
                            className={styles.sidebarToggleBtn}
                            aria-label="Toggle language"
                        >
                            <span className={styles.flag}>{language === 'sv' ? '🇬🇧' : '🇸🇪'}</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={styles.sidebarToggleBtn}
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
