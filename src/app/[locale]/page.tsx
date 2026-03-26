import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { HomeContent } from '@/components/HomeContent';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="flex min-h-screen items-start justify-center px-4">
      <HomeContent dict={dict} locale={locale} />
    </main>
  );
}
