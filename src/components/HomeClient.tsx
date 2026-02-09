'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroStory from '@/components/HeroStory';
import CategoryBar from '@/components/CategoryBar';
import RecentArticles from '@/components/RecentArticles';
import NewsletterModule from '@/components/NewsletterModule';
import AuthorCard from '@/components/AuthorCard';
import { Article, Category } from '@/types';

interface FeaturedAuthor {
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
    topCategories: string[];
}

interface HomeClientProps {
    articles: Article[];
    categories: Category[];
    heroArticles: Article[];
    featuredAuthors: FeaturedAuthor[];
}

export default function HomeClient({ articles, categories, heroArticles, featuredAuthors }: HomeClientProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Filter logic
    const filteredArticles = activeCategory
        ? articles.filter((a) => a.category === activeCategory)
        : articles;

    return (
        <>
            <Header />
            <main>
                <HeroStory articles={heroArticles} />
                <div className="container">
                    <CategoryBar
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                    <div className="main-grid">
                        <aside>
                            {featuredAuthors.map((author, index) => (
                                <AuthorCard key={index} author={author} />
                            ))}
                        </aside>
                        <div>
                            <RecentArticles articles={filteredArticles} />
                        </div>
                    </div>
                    <NewsletterModule />
                </div>
            </main>
            <Footer />
        </>
    );
}
