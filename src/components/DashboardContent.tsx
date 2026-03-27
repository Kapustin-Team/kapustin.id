'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiGet, apiPost } from '@/lib/api';
import { ProfileForm } from '@/components/ProfileForm';
import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/lib/projects';
import { AppSidebar } from '@/components/AppSidebar';
import { Spinner } from '@/components/ui/Spinner';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface DashboardContentProps {
  dict: {
    home: {
      welcome: string;
      loggedInAs: string;
      goToLogin: string;
      securityLink: string;
      settingsLink: string;
    };
    dashboard: {
      title: string;
      projects: string;
    };
    profile: {
      title: string;
      name: string;
      imageUrl: string;
      save: string;
      saved: string;
      error: string;
    };
    common: {
      loading: string;
      logout: string;
    };
  };
  locale: string;
}

function UserAvatar({ user }: { user: User }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name || user.email}
        width={56}
        height={56}
        className="w-14 h-14 rounded-full object-cover border-2 border-[var(--border-color)]"
      />
    );
  }

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="w-14 h-14 rounded-full bg-[var(--fg)] text-white flex items-center justify-center text-[18px] font-semibold tracking-[-0.3px]">
      {initials}
    </div>
  );
}

export function DashboardContent({ dict, locale }: DashboardContentProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<{ user: User & { theme?: string } }>('/auth/me', { signal: controller.signal })
      .then((result) => {
        if (result.data?.user) {
          setUser(result.data.user);
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
            {dict.home.goToLogin}
          </a>
        </div>
      </div>
    );
  }

  const projectCards = projects.map((p) => ({
    name: p.name,
    url: p.url,
    icon: p.icon,
    description: locale === 'ru' ? p.description_ru : p.description_en,
  }));

  return (
    <div className="flex min-h-screen">
      <AppSidebar locale={locale} user={user} dict={dict} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-[720px] mx-auto px-5 md:px-8 py-8 md:py-10">
          {/* Header: Avatar + Greeting */}
          <div className="flex items-center gap-4 mb-8">
            <UserAvatar user={user} />
            <div>
              <h1 className="text-[20px] font-semibold tracking-[-0.4px] text-[var(--fg)]">
                {dict.home.welcome}, {user.name || user.email}
              </h1>
              <p className="text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
                {dict.home.loggedInAs} {user.email}
              </p>
            </div>
          </div>

          {/* Profile Section */}
          <section className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] mb-8">
            <ProfileForm user={user} dict={dict.profile} onUpdate={setUser} />
          </section>

          {/* Projects Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)]">
              {dict.dashboard.projects}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projectCards.map((p) => (
                <ProjectCard key={p.name} project={p} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
