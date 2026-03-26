import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { AuthorizeForm } from '@/components/AuthorizeForm';
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
  return { title: `${dict.authorize.title} — Kapustin ID` };
}

interface AuthorizePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    client_id?: string;
    client_name?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
  }>;
}

export default async function AuthorizePage({
  params,
  searchParams,
}: AuthorizePageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const query = await searchParams;

  const clientId = query.client_id ?? '';
  const clientName = query.client_name ?? '';
  const redirectUri = query.redirect_uri ?? '';
  const scope = query.scope ?? '';
  const state = query.state ?? '';
  const codeChallenge = query.code_challenge ?? '';
  const codeChallengeMethod = query.code_challenge_method ?? 'S256';

  const missingParams = !clientId || !redirectUri || !codeChallenge || !state;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      {missingParams ? (
        <div className="w-full max-w-[360px] mx-auto text-center">
          <h1 className="text-[24px] font-semibold tracking-[-0.5px] text-[var(--fg)] mb-4">
            {dict.common.error}
          </h1>
          <p className="text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
            Missing required OAuth parameters.
          </p>
        </div>
      ) : (
        <AuthorizeForm
          dict={dict.authorize}
          clientId={clientId}
          clientName={clientName}
          redirectUri={redirectUri}
          scope={scope}
          state={state}
          codeChallenge={codeChallenge}
          codeChallengeMethod={codeChallengeMethod}
        />
      )}
    </main>
  );
}
