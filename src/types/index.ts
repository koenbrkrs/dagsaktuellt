export type Language = 'sv' | 'en';

export interface Article {
  id: string;
  title: {
    sv: string;
    en: string;
  };
  excerpt: {
    sv: string;
    en: string;
  };
  content: {
    sv: string;
    en: string;
  };
  category: string;
  author: string;
  publishDate: string;
  featured: boolean;
  image?: string;
}

export interface Category {
  id: string;
  name: {
    sv: string;
    en: string;
  };
  description?: {
    sv: string;
    en: string;
  };
  image?: string;
}

export interface Author {
  name: string;
  title: {
    sv: string;
    en: string;
  };
  bio: {
    sv: string;
    en: string;
  };
  email: string;
  image?: string;
  social: {
    twitter?: string;
    linkedin?: string;
  };
}
