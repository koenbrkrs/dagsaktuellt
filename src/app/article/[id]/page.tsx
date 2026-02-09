'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './Article.module.css';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Data
import articlesData from '@/data/articles.json';
import authorData from '@/data/author.json';
import { Article, Author } from '@/types';

export default function ArticlePage() {
    const params = useParams();
    const { language, t } = useLanguage();

    // Find article
    const article = (articlesData as Article[]).find(a => a.id === params.id);
    const author = authorData as Author;

    if (!article) {
        return (
            <div className={styles.container}>
                <Header />
                <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>
                    <h1>Article not found</h1>
                    <Link href="/" style={{ textDecoration: 'underline' }}>Return home</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.articleContainer}>
            <Header />

            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.category}>{article.category}</span>
                    <h1 className={styles.title}>{article.title[language]}</h1>
                    <p className={styles.excerpt}>{article.excerpt[language]}</p>
                </div>
            </div>

            <div className={styles.articleMeta}>
                <button className={styles.metaBtn}>Full article</button>
                <button className={styles.metaBtn}>Summary</button>
                <button className={styles.metaBtn}>Ask about</button>
            </div>

            <div className={styles.authorSection}>
                <div className={styles.authorImage}></div>
                <div className={styles.authorName}>{article.author}</div>
                <div className={styles.authorTitle}>Independent Journalist</div>
            </div>

            <article className={styles.content}>
                {/* Dynamically rendering content paragraphs */}
                {article.content[language].split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                ))}

                {/* Placeholder content to match the rich template structure since real data is short */}
                <div className={styles.articleImage}></div>
                <p className={styles.imageCaption}>
                    Detailed visualization of the discussed topic. Photo: Press Agency
                </p>

                <h2>Background and Context</h2>
                <p>
                    {language === 'sv'
                        ? "Detta är en djupgående analys av situationen. Artikeln fortsätter med att utforska historiska paralleller och framtida konsekvenser. Vi ser en tydlig trend i utvecklingen som inte kan ignoreras."
                        : "This is an in-depth analysis of the situation. The article continues to explore historical parallels and future consequences. We see a clear trend in development that cannot be ignored."}
                </p>

                <div className={styles.chartImage}></div>
                <p className={styles.imageCaption}>
                    {language === 'sv' ? "Statistisk utveckling över de senaste tio åren." : "Statistical development over the last ten years."}
                </p>

                <p>
                    {language === 'sv'
                        ? "Sammanfattningsvis står vi inför stora förändringar. Det är viktigt att beslutsfattare tar dessa signaler på allvar."
                        : "In conclusion, we are facing major changes. It is important that decision-makers take these signals seriously."}
                </p>
            </article>

            <Footer />
        </div>
    );
}
