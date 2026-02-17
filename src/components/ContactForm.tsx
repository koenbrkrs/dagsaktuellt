'use client';

import { FormEvent, useState } from 'react';
import styles from '@/app/about/About.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactFormProps {
    recipientEmail?: string;
}

export default function ContactForm({ recipientEmail = '' }: ContactFormProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Build mailto: link
        const subject = encodeURIComponent('Contact Form Dagsaktuellt');
        const body = encodeURIComponent(
            `${formData.message}\n\n${formData.name}\n\n${formData.email}`
        );
        const mailto = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

        window.location.href = mailto;
    };

    return (
        <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        placeholder={t('contactName')}
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                </div>
                <div className={styles.formGroup}>
                    <input
                        type="email"
                        placeholder={t('contactEmail')}
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        required
                    />
                </div>
            </div>
            <div className={styles.formGroup}>
                <textarea
                    placeholder={t('contactMessage')}
                    value={formData.message}
                    onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                    }
                />
            </div>
            <button type="submit" className={styles.submitBtn}>
                {t('contactSend')}
            </button>
        </form>
    );
}

