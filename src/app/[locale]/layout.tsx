import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import '../globals.css';
import { locales } from '@/i18n/config';

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
});

export const metadata: Metadata = {
  title: 'Kapustin ID',
  description: 'Authentication and account management for Kapustin services',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} className={`${onest.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full" style={{ fontFamily: 'var(--font-sans)' }}>
        {children}
      </body>
    </html>
  );
}
