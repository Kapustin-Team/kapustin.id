import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { SettingsContent } from '@/components/SettingsContent';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="flex min-h-screen items-start justify-center px-4">
      <SettingsContent dict={dict} locale={locale} />
    </main>
  );
}
