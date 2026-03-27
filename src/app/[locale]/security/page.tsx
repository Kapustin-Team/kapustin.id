import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { SecurityPageContent } from '@/components/SecurityPageContent';

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <SecurityPageContent dict={dict} locale={locale} />;
}
