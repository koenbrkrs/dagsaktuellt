'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './NewsletterModule.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NewsletterModule() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');

        try {
            const res = await fetch('/.netlify/functions/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus('error');
                return;
            }

            if (data.alreadyExists) {
                setStatus('duplicate');
            } else {
                setStatus('success');
                setEmail('');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <section className={styles.newsletterSection}>
            <div className={styles.newsletterContent}>
                <h2>{t('newsletterTitle')}</h2>
                <p>{t('newsletterDescription')}</p>

                {status === 'success' ? (
                    <p className={styles.successMessage}>{t('subscribeSuccess')}</p>
                ) : status === 'duplicate' ? (
                    <p className={styles.duplicateMessage}>{t('subscribeDuplicate')}</p>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.newsletterForm}>
                        <input
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={status === 'loading'}
                        />
                        <button type="submit" disabled={status === 'loading'}>
                            {status === 'loading' ? '...' : t('subscribe')}
                        </button>
                    </form>
                )}

                {status === 'error' && (
                    <p className={styles.errorMessage}>{t('subscribeError')}</p>
                )}
            </div>
            <div className={styles.newsletterImage}>
                <Image
                    src="/newsletter-hero.png"
                    alt="Dagsaktuellt Newsletter"
                    width={400}
                    height={250}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
                />
            </div>
        </section>
    );
}

