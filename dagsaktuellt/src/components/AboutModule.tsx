'use client';

import styles from './AboutModule.module.css';
import { Author } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface AboutModuleProps {
    author: Author;
}

export default function AboutModule({ author }: AboutModuleProps) {
    const { language } = useLanguage();

    return (
        <div className={styles.module} id="about">
            <div className={styles.authorImage}></div>
            <h3 className={styles.title}>{author.name}</h3>
            <p className={styles.role}>{author.title[language]}</p>
            <p className={styles.followText}>Follow me:</p>
            <div className={styles.social}>
                <div className={styles.socialIcon}>📘</div>
                <div className={styles.socialIcon}>🐦</div>
                <div className={styles.socialIcon}>📷</div>
                <div className={styles.socialIcon}>💼</div>
            </div>
            <div className={styles.categoriesList}>
                <h4>Categories</h4>
                <ul>
                    <li>→ Politics</li>
                    <li>→ News</li>
                    <li>→ Current affairs</li>
                    <li>→ Long-term scenarios</li>
                </ul>
            </div>
            <div className={styles.email}>
                <p>📧 Email</p>
                <p><a href={`mailto:${author.email}`}>{author.email}</a></p>
            </div>
        </div>
    );
}
