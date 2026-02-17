'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6';
import styles from './Footer.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface FooterProps {
    topCategories?: { title: { sv: string; en: string }; slug?: string }[];
    topAuthors?: { name: string; slug?: string }[];
}

export default function Footer({ topCategories = [], topAuthors = [] }: FooterProps) {
    const { language, t } = useLanguage();
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubStatus('loading');
        try {
            const res = await fetch('/.netlify/functions/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setSubStatus('error'); return; }
            if (data.alreadyExists) { setSubStatus('duplicate'); }
            else { setSubStatus('success'); setEmail(''); }
        } catch { setSubStatus('error'); }
    };

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContent}>
                    {/* Categories Column — dynamic top 4 */}
                    <div className={styles.footerColumn}>
                        <h3>{t('categories')}</h3>
                        <ul>
                            {topCategories.slice(0, 4).map((cat, i) => (
                                <li key={i}>
                                    <Link href={`/articles?category=${encodeURIComponent(cat.title[language] || cat.title.sv)}`}>
                                        {cat.title[language] || cat.title.sv}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Authors Column — dynamic top 4 */}
                    <div className={styles.footerColumn}>
                        <h3>{t('authors')}</h3>
                        <ul>
                            {topAuthors.slice(0, 4).map((author, i) => (
                                <li key={i}>
                                    <Link href={`/articles?author=${encodeURIComponent(author.name)}`}>
                                        {author.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Overall Column (was "About") */}
                    <div className={styles.footerColumn}>
                        <h3>{t('overall')}</h3>
                        <ul>
                            <li><Link href="/about">{t('aboutUs')}</Link></li>
                            <li><Link href="/articles">{t('allArticlesLink')}</Link></li>
                            <li><Link href="/about#contact">{t('contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Subscribe Section */}
                    <div className={styles.footerSubscribe}>
                        <h3>{t('subscribeNewsletter')}</h3>
                        {subStatus === 'success' ? (
                            <p className={styles.footerSubSuccess}>{t('subscribeSuccess')}</p>
                        ) : subStatus === 'duplicate' ? (
                            <p className={styles.footerSubDuplicate}>{t('subscribeDuplicate')}</p>
                        ) : (
                            <form onSubmit={handleSubscribe}>
                                <input
                                    type="email"
                                    placeholder="youremail@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={subStatus === 'loading'}
                                />
                                <button type="submit" disabled={subStatus === 'loading'}>
                                    {subStatus === 'loading' ? '...' : t('subscribe')}
                                </button>
                            </form>
                        )}
                        {subStatus === 'error' && (
                            <p className={styles.footerSubError}>{t('subscribeError')}</p>
                        )}
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <div className={styles.footerLogo}>
                        <Image
                            src={theme === 'dark' ? '/logo-white.png' : '/logo-black.png'}
                            alt="Dagsaktuellt"
                            width={120}
                            height={25}
                            className={styles.footerLogoImage}
                        />
                    </div>
                    <div className={styles.footerLinks}>
                        <Link href="/cookies">{t('cookies')}</Link>
                        <Link href="/terms">{t('terms')}</Link>
                        <Link href="/support">{t('support')}</Link>
                    </div>
                    <div className={styles.footerSocial}>
                        <div className={styles.footerSocialIcon}>
                            <FaFacebookF />
                        </div>
                        <div className={styles.footerSocialIcon}>
                            <FaInstagram />
                        </div>
                        <div className={styles.footerSocialIcon}>
                            <FaLinkedinIn />
                        </div>
                        <div className={styles.footerSocialIcon}>
                            <FaWhatsapp />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

