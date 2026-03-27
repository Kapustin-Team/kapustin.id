'use client';

import { usePathname } from 'next/navigation';
import { apiPost } from '@/lib/api';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

interface AppSidebarProps {
  locale: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  dict: {
    home: { settingsLink: string; securityLink: string };
    dashboard: { title: string };
    common: { logout: string };
  };
}

export function AppSidebar({ locale, user, dict }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { id: 'home', label: dict.dashboard.title, href: `/${locale}` },
    { id: 'security', label: dict.home.securityLink, href: `/${locale}/security` },
    { id: 'settings', label: dict.home.settingsLink, href: `/${locale}/settings` },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  async function handleLogout() {
    await apiPost('/auth/logout', {});
    window.location.href = `/${locale}/login`;
  }

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col justify-between w-[240px] shrink-0 h-screen sticky top-0 border-r border-[var(--border-color)] bg-[var(--bg)] p-8">
        {/* Top: Logo + Nav */}
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--fg)] flex items-center justify-center">
              <span className="text-white text-[11px] font-bold tracking-tight">K</span>
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.4px] text-[var(--fg)]">
              Kapustin ID
            </span>
          </div>

          {/* Navigation — text-only MenuItems */}
          <nav className="flex flex-col gap-1 items-start">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center px-1 py-[2px] text-[13px] font-medium tracking-[-0.25px] whitespace-nowrap transition-colors duration-150 ${
                    active
                      ? 'bg-[var(--bg-secondary)] text-[var(--fg)]'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Logout + Legal */}
        <div className="flex flex-col gap-5">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-1 py-[2px] text-[13px] font-medium tracking-[-0.25px] text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] transition-colors duration-150 cursor-pointer whitespace-nowrap text-left"
          >
            {dict.common.logout}
          </button>
          <p className="text-[10px] text-[var(--fg-muted)] tracking-[-0.2px] leading-relaxed">
            kapustin.id, {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)] border-t border-[var(--border-color)] flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.id}
              href={item.href}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-[-0.2px] transition-colors duration-150 ${
                active ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'
              }`}
            >
              {item.label}
            </a>
          );
        })}
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-[11px] font-medium tracking-[-0.2px] text-[var(--fg-muted)] cursor-pointer"
        >
          {dict.common.logout}
        </button>
      </nav>
    </>
  );
}
