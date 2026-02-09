'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroStory from '@/components/HeroStory';
import CategoryBar from '@/components/CategoryBar';
import ArticleFeed from '@/components/ArticleFeed';
import AboutModule from '@/components/AboutModule';
import NewsletterModule from '@/components/NewsletterModule';
import RecentArticles from '@/components/RecentArticles';

// Import data
import articlesData from '@/data/articles.json';
import categoriesData from '@/data/categories.json';
import authorData from '@/data/author.json';
import { Article, Category, Author } from '@/types';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const articles = articlesData as Article[];
  const categories = categoriesData as Category[];
  const author = authorData as Author;

  // Get top 3 latest articles for hero
  const heroArticles = [...articles]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 3);

  // Filter articles by category
  const filteredArticles = activeCategory
    ? articles.filter((a) => a.category === activeCategory && !a.featured)
    : articles.filter((a) => !a.featured);

  // Get recent articles (latest 5)
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 5);

  return (
    <>
      <Header />
      <main>
        {/* Hero Story - Full Width Carousel */}
        <HeroStory articles={heroArticles} />

        <div className="container">

          {/* Category Navigation */}
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Main Grid: Sidebar + Article Feed */}
          <div className="main-grid">
            {/* Sidebar */}
            <aside>
              <AboutModule author={author} />
            </aside>

            {/* Main Content: Recent Articles */}
            <div>
              <RecentArticles articles={recentArticles} />
            </div>
          </div>

          {/* Newsletter Section - Full Width */}
          <NewsletterModule />
        </div>
      </main>
      <Footer />
    </>
  );
}
