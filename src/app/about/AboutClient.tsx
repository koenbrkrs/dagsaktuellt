'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './About.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface AboutClientProps {
    heroImageUrl: string;
    aboutTitle: string;
    heroSubtitle: { sv: string; en: string };
    aboutBio: { sv: string; en: string };
    author: {
        name: string;
        jobTitle: { sv: string; en: string };
        image?: string;
        email: string;
        social?: {
            whatsapp?: string;
            facebook?: string;
            linkedin?: string;
            instagram?: string;
        };
    } | null;
    categories: { _id: string; title: { sv: string; en: string } }[];
    topCategories: { title: { sv: string; en: string } }[];
    footerCategories?: { title: { sv: string; en: string } }[];
    footerAuthors?: { name: string }[];
}

export default function AboutClient({
    heroImageUrl,
    aboutTitle,
    heroSubtitle,
    aboutBio,
    author,
    categories,
    topCategories,
    footerCategories,
    footerAuthors,
}: AboutClientProps) {
    const { language, t } = useLanguage();

    const socialLinks = author?.social ? [
        { icon: '📘', url: author.social.facebook },
        { icon: '📷', url: author.social.instagram },
        { icon: '💼', url: author.social.linkedin },
        { icon: '💬', url: author.social.whatsapp },
    ] : [];

    return (
        <>
            <Header topCategories={topCategories} />

            <section
                className={styles.heroSection}
                style={{
                    backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className={styles.heroContent}>
                    <h1>{aboutTitle}</h1>
                    <p>{heroSubtitle[language] || t('aboutHeroSubtitle')}</p>
                </div>
            </section>

            <div className={styles.mainContent}>
                <aside className={styles.sidebar}>
                    {author && (
                        <div className={styles.authorCard}>
                            {author.image ? (
                                <Image
                                    src={author.image}
                                    alt={author.name}
                                    width={200}
                                    height={200}
                                    className={styles.authorImage}
                                />
                            ) : (
                                <div className={styles.authorImagePlaceholder}></div>
                            )}
                            <h2 className={styles.authorName}>{author.name}</h2>
                            <p className={styles.authorTitle}>{author.jobTitle[language]}</p>

                            <div className={styles.authorSocial}>
                                <p>{t('followOn')}</p>
                                <div className={styles.socialIcons}>
                                    {socialLinks.map((social, i) =>
                                        social.url ? (
                                            <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                                                {social.icon}
                                            </a>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.sidebarSection}>
                        <h3>{t('categories')}</h3>
                        <ul>
                            {categories.map((cat) => (
                                <li key={cat._id}>
                                    <Link href={`/articles?category=${encodeURIComponent(cat.title[language])}`}>
                                        {cat.title[language]}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {author?.email && (
                        <div className={styles.authorEmail}>
                            <p className={styles.emailLabel}>
                                <span>📧</span>
                                <span>Email</span>
                            </p>
                            <p className={styles.emailAddress}>
                                <a href={`mailto:${author.email}`}>{author.email}</a>
                            </p>
                        </div>
                    )}
                </aside>

                <main className={styles.contentSection}>
                    <section className={styles.aboutSection}>
                        <h2>{t('aboutPrefix')} {author?.name}</h2>
                        {aboutBio[language] && <p>{aboutBio[language]}</p>}
                    </section>

                    <section id="contact" className={styles.contactSection}>
                        <h2>{t('contactHeading')}</h2>
                        <p className={styles.contactDescription}>
                            {t('contactDescription')}
                        </p>

                        <ContactForm recipientEmail={author?.email || ''} />
                    </section>
                </main>
            </div>

            <Footer topCategories={footerCategories} topAuthors={footerAuthors} />
        </>
    );
}
