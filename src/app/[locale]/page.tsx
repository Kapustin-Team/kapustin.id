import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { DashboardContent } from '@/components/DashboardContent';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <DashboardContent dict={dict} locale={locale} />;
}
