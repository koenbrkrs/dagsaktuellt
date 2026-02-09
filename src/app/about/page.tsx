'use client';

import Link from 'next/link';
import styles from './About.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

// Data
import authorData from '@/data/author.json';
import categoriesData from '@/data/categories.json';
import { Author, Category } from '@/types';

export default function AboutPage() {
    const { language, t } = useLanguage();

    const author = authorData as Author;
    const categories = categoriesData as Category[];

    return (
        <>
            <Header />

            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>{language === 'sv' ? 'Om DagsAktuellt' : 'About DagsAktuellt'}</h1>
                    <p>{language === 'sv'
                        ? 'Dagsaktuellt är din källa för djupgående analyser och nyheter om demografi, samhällsutveckling och politik i Sverige och världen.'
                        : 'Dagsaktuellt is your source for in-depth analysis and news on demography, societal development, and politics in Sweden and the world.'}
                    </p>
                </div>
            </section>

            <div className={styles.mainContent}>
                <aside className={styles.sidebar}>
                    <div className={styles.authorCard}>
                        <div className={styles.authorImage}></div>
                        <h2 className={styles.authorName}>{author.name}</h2>
                        <p className={styles.authorTitle}>{author.title[language]}</p>

                        <div className={styles.authorSocial}>
                            <p>{language === 'sv' ? 'Följ på:' : 'Follow on:'}</p>
                            <div className={styles.socialIcons}>
                                <div className={styles.socialIcon}>📘</div>
                                <div className={styles.socialIcon}>🐦</div>
                                <div className={styles.socialIcon}>📷</div>
                                <div className={styles.socialIcon}>💼</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sidebarSection}>
                        <h3>{language === 'sv' ? 'Kategorier' : 'Categories'}</h3>
                        <ul>
                            {categories.map((cat) => (
                                <li key={cat.id}>{cat.name[language]}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.authorEmail}>
                        <p className={styles.emailLabel}>
                            <span>📧</span>
                            <span>Email</span>
                        </p>
                        <p className={styles.emailAddress}>{author.email}</p>
                    </div>
                </aside>

                <main className={styles.contentSection}>
                    <section className={styles.aboutSection}>
                        <h2>{language === 'sv' ? `Om ${author.name}` : `About ${author.name}`}</h2>
                        <p>{author.bio[language]}</p>
                        <p>{language === 'sv'
                            ? 'Dagsaktuellt drivs av en passion för att förstå de underliggande strömningarna i vårt samhälle. Vi tror på att data och demografi berättar en historia som ofta förbises i den dagliga nyhetsrapporteringen.'
                            : 'Dagsaktuellt is driven by a passion to understand the underlying currents in our society. We believe that data and demography tell a story that is often overlooked in daily news reporting.'}
                        </p>
                    </section>

                    <section className={styles.contactSection}>
                        <h2>{language === 'sv' ? 'Kontakt' : 'Contact'}</h2>
                        <p className={styles.contactDescription}>
                            {language === 'sv'
                                ? 'Vill du få dina tankar publicerade i en artikel? Vill du samarbeta? Feedback? Kontakta mig i formuläret nedan så hörs vi!'
                                : 'Would you like to have your thoughts published in an article? Would you like to collaborate? Feedback? Contact me in the form below, and we\'ll hear from you!'}
                        </p>

                        <form className={styles.contactForm} onSubmit={(e) => e.preventDefault()}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <input type="text" placeholder={language === 'sv' ? 'Namn' : 'Name'} />
                                </div>
                                <div className={styles.formGroup}>
                                    <input type="email" placeholder={language === 'sv' ? 'E-post (krävs)' : 'Email (required)'} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <textarea placeholder={language === 'sv' ? 'Meddelande' : 'Message'}></textarea>
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                {language === 'sv' ? 'Skicka' : 'Send'}
                            </button>
                        </form>
                    </section>
                </main>
            </div>

            <Footer />
        </>
    );
}
