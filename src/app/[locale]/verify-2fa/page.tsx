import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { VerifyTwoFactorForm } from '@/components/VerifyTwoFactorForm';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return { title: `${dict.twoFactor.codeTitle} — Kapustin ID` };
}

export default async function VerifyTwoFactorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <VerifyTwoFactorForm dict={dict} locale={locale} />
    </main>
  );
}
