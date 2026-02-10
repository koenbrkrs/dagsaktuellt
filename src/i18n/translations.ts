export const translations = {
    sv: {
        // Navigation
        allArticles: 'Alla Artiklar',
        about: 'Om',
        recent: 'Senaste',
        subscribe: 'Prenumerera',

        // Categories
        categories: 'Kategorier',
        currentAffairs: 'Aktuella Frågor',
        sweden: 'Sverige',
        demography: 'Demografi',
        publicTransport: 'Kollektivtrafik',
        editorialTeam: 'Redaktion',
        viewAllArticles: 'Visa alla artiklar',
        politics: 'Politik',

        // Article
        by: 'av',
        readMore: 'Läs mer',

        // About
        aboutTitle: 'Om',
        aboutUs: 'Om oss',

        // Newsletter
        newsletterTitle: 'Prenumerera på vårt nyhetsbrev',
        newsletterDescription: 'Få de senaste artiklarna och analyserna direkt i din inkorg varje vecka.',
        emailPlaceholder: 'Din e-postadress',
        gdprConsent: 'Jag godkänner behandlingen av mina personuppgifter enligt GDPR',
        subscribeButton: 'Prenumerera',
        subscribeSuccess: 'Tack! Du har prenumererat.',
        emailRequired: 'E-postadress krävs',
        gdprRequired: 'Du måste godkänna GDPR',
        subscribeNewsletter: 'Prenumerera på vårt nyhetsbrev',

        // Recent Articles
        recentArticles: 'Senaste artiklarna',

        // Footer
        privacyPolicy: 'Integritetspolicy',
        termsOfService: 'Användarvillkor',
        copyright: '© 2026 Dagsaktuellt. Alla rättigheter förbehållna.',
        authors: 'Författare',
        contact: 'Kontakt',
        advertise: 'Annonsera',
        careers: 'Karriär',
        cookies: 'Cookies',
        terms: 'Villkor',
        support: 'Support',

        // Misc
        breaking: 'BRYT ANDE',
        // Filters & Search
        filters: 'Filter',
        clearAll: 'Rensa alla',
        search: 'Sök',
        searchPlaceholder: 'Sök artiklar...',
        category: 'Kategori',
        allCategories: 'Alla kategorier',
        selected: 'valda',
        published: 'Publicerad',
        allTime: 'All tid',
        today: 'Idag',
        lastWeek: 'Senaste 7 dagarna',
        lastMonth: 'Senaste 30 dagarna',
        lastYear: 'Senaste året',
        noArticlesFound: 'Inga artiklar hittades',
        tryAdjustingFilters: 'Prova att justera dina filter',
        resetFilters: 'Återställ filter',
    },
    en: {
        // Navigation
        allArticles: 'All Articles',
        about: 'About',
        recent: 'Recent',
        subscribe: 'Subscribe',

        // Categories
        categories: 'Categories',
        currentAffairs: 'Current Affairs',
        sweden: 'Sweden',
        demography: 'Demography',
        publicTransport: 'Public Transport',
        editorialTeam: 'Editorial Team',
        viewAllArticles: 'View all articles',
        politics: 'Politics',

        // Article
        by: 'by',
        readMore: 'Read more',

        // About
        aboutTitle: 'About',
        aboutUs: 'About us',

        // Newsletter
        newsletterTitle: 'Subscribe to our newsletter',
        newsletterDescription: 'Get the latest articles and analyses delivered directly to your inbox every week.',
        emailPlaceholder: 'Your email address',
        gdprConsent: 'I consent to the processing of my personal data according to GDPR',
        subscribeButton: 'Subscribe',
        subscribeSuccess: 'Thank you! You have subscribed.',
        emailRequired: 'Email address is required',
        gdprRequired: 'You must accept GDPR',
        subscribeNewsletter: 'Subscribe to our newsletter',

        // Recent Articles
        recentArticles: 'Recent articles',

        // Footer
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        copyright: '© 2026 Dagsaktuellt. All rights reserved.',
        authors: 'Authors',
        contact: 'Contact',
        advertise: 'Advertise',
        careers: 'Careers',
        cookies: 'Cookies',
        terms: 'Terms',
        support: 'Support',

        // Misc
        breaking: 'BREAKING',

        // Filters & Search
        filters: 'Filters',
        clearAll: 'Clear All',
        search: 'Search',
        searchPlaceholder: 'Search articles...',
        category: 'Category',
        allCategories: 'All Categories',
        selected: 'selected',
        published: 'Published',
        allTime: 'All Time',
        today: 'Today',
        lastWeek: 'Last 7 Days',
        lastMonth: 'Last 30 Days',
        lastYear: 'Last Year',
        noArticlesFound: 'No articles found',
        tryAdjustingFilters: 'Try adjusting your filters',
        resetFilters: 'Reset Filters',
    }
};

export type TranslationKey = keyof typeof translations.sv;
