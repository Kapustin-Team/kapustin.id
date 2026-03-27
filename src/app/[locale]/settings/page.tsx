import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { SettingsPageContent } from '@/components/SettingsPageContent';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <SettingsPageContent dict={dict} locale={locale} />;
}
