'use client';

import styles from './ArticleFeed.module.css';
import ArticleCard from './ArticleCard';
import { Article } from '@/types';

interface ArticleFeedProps {
    articles: Article[];
}

export default function ArticleFeed({ articles }: ArticleFeedProps) {
    return (
        <div className={styles.feed}>
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
            ))}
        </div>
    );
}
