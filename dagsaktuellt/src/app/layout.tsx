import type { Metadata } from 'next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dagsaktuellt — Seriös nordisk journalistik',
  description: 'Dagsaktuellt är en seriös digital nyhetstidning med fokus på svensk politik, demografi och samhällsutveckling.',
  keywords: ['nyheter', 'Sverige', 'journalistik', 'demografi', 'kollektivtrafik'],
  authors: [{ name: 'Julius Jönson' }],
  openGraph: {
    title: 'Dagsaktuellt',
    description: 'Seriös nordisk journalistik',
    type: 'website',
    locale: 'sv_SE',
    alternateLocale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Netlify Identity Widget for CMS Authentication */}
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
