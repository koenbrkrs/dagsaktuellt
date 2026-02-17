import { client } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import AboutClient from './AboutClient';

export const revalidate = 60;

// GROQ query for About Page data
const aboutPageQuery = `*[_type == "aboutPage"][0] {
  title,
  mainImage,
  heroSubtitle,
  aboutBio
}`;

// Helper to cross-fill localized strings
function localizedStr(val: any): { sv: string; en: string } {
    if (val == null) return { sv: '', en: '' };
    if (typeof val === 'string') return { sv: val, en: val };
    const sv = typeof val.sv === 'string' ? val.sv : '';
    const en = typeof val.en === 'string' ? val.en : '';
    return { sv: sv || en, en: en || sv };
}

export default async function AboutPage() {
    const aboutPageData = await client.fetch(aboutPageQuery);

    const heroImageUrl = aboutPageData?.mainImage
        ? urlForImage(aboutPageData.mainImage).width(1920).height(800).url()
        : '';

    // Fetch header + footer data
    const topCategoriesQuery = `*[_type == "category" && displayInHeader == true]{title}`;
    const footerCategoriesQuery = `*[_type == "category"]{
        title,
        "articleCount": count(*[_type == "post" && references(^._id)])
    } | order(articleCount desc)[0...4]`;
    const topAuthorsQuery = `*[_type == "author"]|order(count(*[_type == "post" && references(^._id)]) desc)[0...4]{name}`;

    // Fetch all categories for sidebar
    const allCategoriesQuery = `*[_type == "category"]{_id, title}`;

    // Fetch author data from CMS
    const authorQuery = `*[_type == "author" && showOnLandingPage == true][0]{
        name,
        jobTitle,
        image,
        email,
        social
    }`;

    const [rawTopCategories, rawFooterCats, topAuthors, allCategories, authorData] = await Promise.all([
        client.fetch(topCategoriesQuery),
        client.fetch(footerCategoriesQuery),
        client.fetch(topAuthorsQuery),
        client.fetch(allCategoriesQuery),
        client.fetch(authorQuery),
    ]);

    const topCategories = rawTopCategories.map((cat: any) => ({
        title: localizedStr(cat.title),
    }));

    const footerCategories = rawFooterCats.map((cat: any) => ({
        title: localizedStr(cat.title),
    }));

    const categories = allCategories.map((cat: any) => ({
        _id: cat._id,
        title: localizedStr(cat.title),
    }));

    // Build author prop
    const author = authorData ? {
        name: authorData.name || '',
        jobTitle: localizedStr(authorData.jobTitle),
        image: authorData.image ? urlForImage(authorData.image).width(200).height(200).url() : undefined,
        email: authorData.email || '',
        social: authorData.social,
    } : null;

    const aboutBio = localizedStr(aboutPageData?.aboutBio);
    const heroSubtitle = localizedStr(aboutPageData?.heroSubtitle);
    const aboutTitle = aboutPageData?.title || 'Om DagsAktuellt';

    return (
        <AboutClient
            heroImageUrl={heroImageUrl}
            aboutTitle={aboutTitle}
            heroSubtitle={heroSubtitle}
            aboutBio={aboutBio}
            author={author}
            categories={categories}
            topCategories={topCategories}
            footerCategories={footerCategories}
            footerAuthors={topAuthors}
        />
    );
}

