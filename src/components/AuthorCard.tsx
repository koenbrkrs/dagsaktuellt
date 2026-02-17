'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaWhatsapp, FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa6';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import styles from './AuthorCard.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocalizedCategory {
    sv: string;
    en: string;
}

interface AuthorCardProps {
    author: {
        name: string;
        jobTitle?: string;
        image?: string;
        email?: string;
        social?: {
            whatsapp?: string;
            facebook?: string;
            linkedin?: string;
            instagram?: string;
        };
        topCategories: (string | LocalizedCategory)[];
    };
}

export default function AuthorCard({ author }: AuthorCardProps) {
    const { language, t } = useLanguage();

    const socialLinks = [
        { icon: FaWhatsapp, url: author.social?.whatsapp, label: 'WhatsApp' },
        { icon: FaFacebookF, url: author.social?.facebook, label: 'Facebook' },
        { icon: FaLinkedinIn, url: author.social?.linkedin, label: 'LinkedIn' },
        { icon: FaInstagram, url: author.social?.instagram, label: 'Instagram' },
    ];

    // Helper to get localized category name
    const getCategoryName = (cat: string | LocalizedCategory): string => {
        if (typeof cat === 'string') return cat;
        return cat[language] || cat.sv || cat.en || '';
    };

    // Helper to get category for URL (use sv as canonical fallback)
    const getCategorySlug = (cat: string | LocalizedCategory): string => {
        if (typeof cat === 'string') return cat;
        return cat[language] || cat.sv || cat.en || '';
    };

    return (
        <div className={styles.authorCard}>
            {/* Profile Image */}
            <div className={styles.imageWrapper}>
                {author.image ? (
                    <Image
                        src={author.image}
                        alt={author.name}
                        width={120}
                        height={120}
                        className={styles.authorImage}
                    />
                ) : (
                    <div className={styles.imagePlaceholder} />
                )}
            </div>

            {/* Name and Job Title */}
            <h3 className={styles.authorName}>{author.name}</h3>
            {author.jobTitle && (
                <p className={styles.authorJobTitle}>{author.jobTitle}</p>
            )}

            {/* Social Media */}
            {author.social && (
                <div className={styles.socialSection}>
                    <p className={styles.socialLabel}>{t('followOn')}</p>
                    <div className={styles.socialIcons}>
                        {socialLinks.map((social, index) => {
                            const Icon = social.icon;
                            if (!social.url) return null;

                            return (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialIcon}
                                    aria-label={social.label}
                                >
                                    <Icon />
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Categories */}
            {author.topCategories && author.topCategories.length > 0 && (
                <div className={styles.categoriesSection}>
                    <h4 className={styles.categoriesTitle}>{t('categories')}</h4>
                    <div className={styles.categoriesList}>
                        {author.topCategories.slice(0, 5).map((category, index) => (
                            <Link
                                key={index}
                                href={`/articles?category=${encodeURIComponent(getCategorySlug(category))}`}
                                className={styles.categoryItem}
                            >
                                <FiArrowRight className={styles.categoryArrow} />
                                <span>{getCategoryName(category)}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Email */}
            {author.email && (
                <div className={styles.emailSection}>
                    <FiMail className={styles.emailIcon} />
                    <a href={`mailto:${author.email}`} className={styles.emailLink}>
                        {author.email}
                    </a>
                </div>
            )}
        </div>
    );
}

