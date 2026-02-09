import Link from 'next/link';
import styles from './About.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { client } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';

// Data
import authorData from '@/data/author.json';
import categoriesData from '@/data/categories.json';
import { Author, Category } from '@/types';

export const revalidate = 60;

// GROQ query for About Page data
const aboutPageQuery = `*[_type == "aboutPage"][0] {
  title,
  mainImage
}`;

export default async function AboutPage() {
    // Fetch About Page data
    const aboutPageData = await client.fetch(aboutPageQuery);

    // Get background image URL
    const heroImageUrl = aboutPageData?.mainImage
        ? urlForImage(aboutPageData.mainImage).width(1920).height(800).url()
        : '';

    const author = authorData as Author;
    const categories = categoriesData as Category[];

    return (
        <>
            <Header />

            <section
                className={styles.heroSection}
                style={{
                    backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className={styles.heroContent}>
                    <h1>{aboutPageData?.title || 'Om DagsAktuellt'}</h1>
                    <p>
                        Dagsaktuellt är din källa för djupgående analyser och nyheter om demografi,
                        samhällsutveckling och politik i Sverige och världen.
                    </p>
                </div>
            </section>

            <div className={styles.mainContent}>
                <aside className={styles.sidebar}>
                    <div className={styles.authorCard}>
                        <div className={styles.authorImage}></div>
                        <h2 className={styles.authorName}>{author.name}</h2>
                        <p className={styles.authorTitle}>{author.title.sv}</p>

                        <div className={styles.authorSocial}>
                            <p>Följ på:</p>
                            <div className={styles.socialIcons}>
                                <div className={styles.socialIcon}>📘</div>
                                <div className={styles.socialIcon}>🐦</div>
                                <div className={styles.socialIcon}>📷</div>
                                <div className={styles.socialIcon}>💼</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sidebarSection}>
                        <h3>Kategorier</h3>
                        <ul>
                            {categories.map((cat) => (
                                <li key={cat.id}>{cat.name.sv}</li>
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
                        <h2>Om {author.name}</h2>
                        <p>{author.bio.sv}</p>
                        <p>
                            Dagsaktuellt drivs av en passion för att förstå de underliggande strömningarna
                            i vårt samhälle. Vi tror på att data och demografi berättar en historia som
                            ofta förbises i den dagliga nyhetsrapporteringen.
                        </p>
                    </section>

                    <section className={styles.contactSection}>
                        <h2>Kontakt</h2>
                        <p className={styles.contactDescription}>
                            Vill du få dina tankar publicerade i en artikel? Vill du samarbeta? Feedback?
                            Kontakta mig i formuläret nedan så hörs vi!
                        </p>

                        <ContactForm />
                    </section>
                </main>
            </div>

            <Footer />
        </>
    );
}
