'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { SettingsContent } from '@/components/SettingsContent';
import { Spinner } from '@/components/ui/Spinner';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface SettingsPageContentProps {
  dict: Record<string, unknown>;
  locale: string;
}

export function SettingsPageContent({ dict, locale }: SettingsPageContentProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<{ user: User }>('/auth/me', { signal: controller.signal })
      .then((result) => {
        if (result.data?.user) setUser(result.data.user);
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
    window.location.href = `/${locale}/login`;
    return null;
  }

  const typedDict = dict as Parameters<typeof SettingsContent>[0]['dict'];
  const sidebarDict = dict as Parameters<typeof AppSidebar>[0]['dict'];

  return (
    <div className="h-screen flex overflow-hidden">
      <AppSidebar locale={locale} user={user} dict={sidebarDict} />
      <main className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-6 md:px-8 pt-6">
          <AppTopBar user={user} />
        </div>
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-[640px] mx-auto px-5 md:px-8 py-8 md:py-10">
            <SettingsContent dict={typedDict} locale={locale} />
          </div>
        </div>
      </main>
    </div>
  );
}
