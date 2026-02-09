'use client';

import { FormEvent, useState } from 'react';
import styles from '@/app/about/About.module.css';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Implement form submission logic (e.g., API call)
        console.log('Form submitted:', formData);
        // Reset form after submission
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        placeholder="Namn"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                </div>
                <div className={styles.formGroup}>
                    <input
                        type="email"
                        placeholder="E-post (krävs)"
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
                    placeholder="Meddelande"
                    value={formData.message}
                    onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                    }
                />
            </div>
            <button type="submit" className={styles.submitBtn}>
                Skicka
            </button>
        </form>
    );
}
