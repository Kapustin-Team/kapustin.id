'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface HomeContentProps {
  dict: {
    home: {
      welcome: string;
      loggedInAs: string;
      goToLogin: string;
    };
    common: {
      loading: string;
    };
  };
  locale: string;
}

export function HomeContent({ dict, locale }: HomeContentProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    apiGet<{ user: User }>('/auth/me')
      .then((result) => {
        if (result.data?.user) {
          setUser(result.data.user);
        }
      })
      .catch(() => {
        // Treat any error as unauthenticated
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return (
      <div className="text-center">
        <p className="text-[var(--fg-secondary)] text-[13px] tracking-[-0.25px]">
          {dict.common.loading}
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="text-center max-w-[360px]">
        <h1 className="text-[24px] font-semibold tracking-[-0.5px] text-[var(--fg)] mb-2">
          {dict.home.welcome}, {user.name || user.email}
        </h1>
        <p className="text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
          {dict.home.loggedInAs} {user.email}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center max-w-[360px]">
      <h1 className="text-[24px] font-semibold tracking-[-0.5px] text-[var(--fg)] mb-4">
        Kapustin ID
      </h1>
      <a
        href={`/${locale}/login`}
        className="inline-flex items-center justify-center font-medium text-[13px] px-6 py-2.5 rounded-full tracking-[-0.25px] bg-[var(--fg)] text-white border border-white hover:opacity-90 transition-all duration-[var(--transition-fast)]"
      >
        {dict.home.goToLogin}
      </a>
    </div>
  );
}
