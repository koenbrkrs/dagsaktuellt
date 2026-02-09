'use client';

import Link from 'next/link';
import styles from './Footer.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContent}>
                    {/* Categories Column */}
                    <div className={styles.footerColumn}>
                        <h3>{t('categories')}</h3>
                        <ul>
                            <li><Link href="#">{t('currentAffairs')}</Link></li>
                            <li><Link href="#">{t('recent')}</Link></li>
                            <li><Link href="#">{t('sweden')}</Link></li>
                            <li><Link href="#">{t('politics')}</Link></li>
                        </ul>
                    </div>

                    {/* Authors Column */}
                    <div className={styles.footerColumn}>
                        <h3>{t('authors')}</h3>
                        <ul>
                            <li><Link href="#">Julius</Link></li>
                            <li><Link href="#">Sarah</Link></li>
                            <li><Link href="#">Michael</Link></li>
                            <li><Link href="#">Emma</Link></li>
                        </ul>
                    </div>

                    {/* About Column */}
                    <div className={styles.footerColumn}>
                        <h3>{t('about')}</h3>
                        <ul>
                            <li><Link href="#">{t('aboutUs')}</Link></li>
                            <li><Link href="#">{t('contact')}</Link></li>
                            <li><Link href="#">{t('advertise')}</Link></li>
                            <li><Link href="#">{t('careers')}</Link></li>
                        </ul>
                    </div>

                    {/* Subscribe Section */}
                    <div className={styles.footerSubscribe}>
                        <h3>{t('subscribeNewsletter')}</h3>
                        <input type="email" placeholder="youremail@email.com" />
                        <button>{t('subscribe')}</button>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <div className={styles.footerLogo}>Dagsaktuellt</div>
                    <div className={styles.footerLinks}>
                        <Link href="/cookies">{t('cookies')}</Link>
                        <Link href="/terms">{t('terms')}</Link>
                        <Link href="/support">{t('support')}</Link>
                    </div>
                    <div className={styles.footerSocial}>
                        <div className={styles.footerSocialIcon}>📘</div>
                        <div className={styles.footerSocialIcon}>🐦</div>
                        <div className={styles.footerSocialIcon}>📷</div>
                        <div className={styles.footerSocialIcon}>💼</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
