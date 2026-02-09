'use client';

import { useState } from 'react';
import styles from './NewsletterModule.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NewsletterModule() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter subscription
        alert('Subscription submitted!');
        setEmail('');
    };

    return (
        <section className={styles.newsletterSection}>
            <div className={styles.newsletterContent}>
                <h2>{t('newsletterTitle')}</h2>
                <p>{t('newsletterDescription')}</p>
                <form onSubmit={handleSubmit} className={styles.newsletterForm}>
                    <input
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">{t('subscribe')}</button>
                </form>
            </div>
            <div className={styles.newsletterImage}></div>
        </section>
    );
}
