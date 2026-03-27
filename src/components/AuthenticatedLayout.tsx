'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { AppSidebar } from '@/components/AppSidebar';
import { Spinner } from '@/components/ui/Spinner';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  theme?: string;
  locale?: string;
}

interface AuthenticatedLayoutProps {
  dict: Record<string, unknown>;
  locale: string;
  children: (user: User) => React.ReactNode;
}

export function AuthenticatedLayout({ dict, locale, children }: AuthenticatedLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<{ user: User }>('/auth/me', { signal: controller.signal })
      .then((result) => {
        if (result.data?.user) {
          setUser(result.data.user);
          // Sync theme cookie
          const userTheme = result.data.user.theme;
          if (userTheme) {
            document.cookie = `theme=${encodeURIComponent(userTheme)};max-age=${365 * 86400};path=/;SameSite=Lax`;
          }
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));

    return () => controller.abort();
  }, []);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Not authenticated — show login prompt
    const d = dict as { home?: { goToLogin?: string } };
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-[360px]">
          <h1 className="text-[24px] font-semibold tracking-[-0.5px] text-[var(--fg)] mb-4">
            Kapustin ID
          </h1>
          <a
            href={`/${locale}/login`}
            className="inline-flex items-center justify-center font-medium text-[13px] px-6 py-2.5 rounded-full tracking-[-0.25px] bg-[var(--fg)] text-white border border-white hover:opacity-90 transition-all duration-[var(--transition-fast)]"
          >
            {d.home?.goToLogin || 'Sign in'}
          </a>
        </div>
      </div>
    );
  }

  const sidebarDict = dict as {
    home: { settingsLink: string; securityLink: string };
    dashboard: { title: string };
    common: { logout: string };
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar locale={locale} user={user} dict={sidebarDict} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-[720px] mx-auto px-5 md:px-8 py-8 md:py-10">
          {children(user)}
        </div>
      </main>
    </div>
  );
}
