'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { ProfileForm } from '@/components/ProfileForm';
import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/lib/projects';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface HomeContentProps {
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
      <img
        src={user.image}
        alt={user.name || user.email}
        className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border-color)]"
      />
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="w-16 h-16 rounded-full bg-[var(--fg)] text-white flex items-center justify-center text-[20px] font-semibold tracking-[-0.3px]">
      {initials}
    </div>
  );
}

export function HomeContent({ dict, locale }: HomeContentProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    apiGet<{ user: User & { theme?: string; locale?: string } }>('/auth/me')
      .then((result) => {
        if (result.data?.user) {
          setUser(result.data.user);
          // Sync theme cookie from API response for cross-device consistency
          const userTheme = (result.data.user as User & { theme?: string }).theme;
          if (userTheme) {
            document.cookie = `theme=${encodeURIComponent(userTheme)};max-age=${365 * 86400};path=/;SameSite=Lax`;
          }
        }
      })
      .catch(() => {
        // Treat any error as unauthenticated
      })
      .finally(() => setChecked(true));
  }, []);

  async function handleLogout() {
    await apiPost('/auth/logout', {});
    window.location.reload();
  }

  if (!checked) {
    return (
      <div className="text-center">
        <p className="text-[var(--fg-secondary)] text-[13px] tracking-[-0.25px]">
          {dict.common.loading}
        </p>
      </div>
    );
  }

  if (!user) {
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

  const projectCards = projects.map((p) => ({
    name: p.name,
    url: p.url,
    icon: p.icon,
    description: locale === 'ru' ? p.description_ru : p.description_en,
  }));

  return (
    <div className="w-full max-w-[640px] flex flex-col gap-8 py-12">
      {/* Header: Avatar + Greeting */}
      <div className="flex items-center gap-4">
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
      <section className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
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

      {/* Security & Logout */}
      <div className="pt-2 flex items-center gap-4">
        <a
          href={`/${locale}/security`}
          className="text-[13px] tracking-[-0.25px] text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors duration-[var(--transition-fast)]"
        >
          {dict.home.securityLink}
        </a>
        <a
          href={`/${locale}/settings`}
          className="text-[13px] tracking-[-0.25px] text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors duration-[var(--transition-fast)]"
        >
          {dict.home.settingsLink}
        </a>
        <button
          onClick={handleLogout}
          className="text-[13px] tracking-[-0.25px] text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors duration-[var(--transition-fast)] cursor-pointer"
        >
          {dict.common.logout}
        </button>
      </div>
    </div>
  );
}
