'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPatch, apiDelete } from '@/lib/api';

type ThemeValue = 'light' | 'dark' | 'system';

interface LinkedAccount {
  id: string;
  provider: string;
  providerAccountId: string;
}

interface SettingsContentProps {
  dict: {
    settings: {
      title: string;
      theme: {
        label: string;
        light: string;
        dark: string;
        system: string;
      };
      language: {
        label: string;
        ru: string;
        en: string;
      };
      accounts: {
        title: string;
        unlink: string;
        unlinkConfirm: string;
        lastMethodWarning: string;
        noAccounts: string;
        twoFactorWarning: string;
      };
      newDeviceNotification: string;
      back: string;
    };
    common: {
      loading: string;
    };
  };
  locale: string;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function applyTheme(theme: ThemeValue) {
  let resolved = theme;
  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = resolved;
}

export function SettingsContent({ dict, locale }: SettingsContentProps) {
  const [theme, setTheme] = useState<ThemeValue>('system');
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [confirmUnlinkId, setConfirmUnlinkId] = useState<string | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);

  // Initialize theme from cookie
  useEffect(() => {
    const saved = getCookie('theme') as ThemeValue | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setTheme(saved);
    }
  }, []);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Fetch linked accounts
  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    const result = await apiGet<{ accounts: LinkedAccount[]; hasPassword: boolean }>('/auth/accounts');
    if (result.data) {
      setAccounts(result.data.accounts);
      setHasPassword(result.data.hasPassword);
    }
    setLoadingAccounts(false);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function handleThemeChange(newTheme: ThemeValue) {
    setTheme(newTheme);
    applyTheme(newTheme);
    setCookie('theme', newTheme, 365);
    apiPatch('/auth/preferences', { theme: newTheme });
  }

  function handleLanguageChange(newLocale: string) {
    if (newLocale === locale) return;
    apiPatch('/auth/preferences', { locale: newLocale }).then(() => {
      setCookie('NEXT_LOCALE', newLocale, 365);
      const path = window.location.pathname.replace(`/${locale}`, `/${newLocale}`);
      window.location.href = path;
    });
  }

  async function handleUnlink(account: LinkedAccount) {
    // Check if this is the last method
    const totalMethods = accounts.length + (hasPassword ? 1 : 0);
    if (totalMethods <= 1) {
      setUnlinkError(dict.settings.accounts.lastMethodWarning);
      setTimeout(() => setUnlinkError(null), 4000);
      return;
    }

    if (confirmUnlinkId !== account.id) {
      setConfirmUnlinkId(account.id);
      setUnlinkError(null);
      return;
    }

    setUnlinkingId(account.id);
    setConfirmUnlinkId(null);
    const result = await apiDelete(`/auth/accounts/${account.id}`);
    if (result.error) {
      setUnlinkError(result.error);
      setTimeout(() => setUnlinkError(null), 4000);
    } else {
      await fetchAccounts();
    }
    setUnlinkingId(null);
  }

  const themeOptions: { value: ThemeValue; label: string }[] = [
    { value: 'light', label: dict.settings.theme.light },
    { value: 'dark', label: dict.settings.theme.dark },
    { value: 'system', label: dict.settings.theme.system },
  ];

  const languageOptions = [
    { value: 'ru', label: dict.settings.language.ru },
    { value: 'en', label: dict.settings.language.en },
  ];

  const providerLabels: Record<string, string> = {
    google: 'Google',
    yandex: 'Yandex',
    telegram: 'Telegram',
  };

  return (
    <div className="w-full max-w-[640px] flex flex-col gap-8 py-12">
      {/* Header */}
      <h1 className="text-[20px] font-semibold tracking-[-0.4px] text-[var(--fg)]">
        {dict.settings.title}
      </h1>

      {/* Theme Section */}
      <section className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)] mb-4">
          {dict.settings.theme.label}
        </h2>
        <div className="flex gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleThemeChange(opt.value)}
              className={`px-4 py-2 rounded-full text-[13px] tracking-[-0.25px] font-medium transition-all duration-[var(--transition-fast)] cursor-pointer ${
                theme === opt.value
                  ? 'bg-[var(--fg)] text-[var(--bg)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] hover:text-[var(--fg)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Language Section */}
      <section className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)] mb-4">
          {dict.settings.language.label}
        </h2>
        <div className="flex gap-2">
          {languageOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleLanguageChange(opt.value)}
              className={`px-4 py-2 rounded-full text-[13px] tracking-[-0.25px] font-medium transition-all duration-[var(--transition-fast)] cursor-pointer ${
                locale === opt.value
                  ? 'bg-[var(--fg)] text-[var(--bg)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] hover:text-[var(--fg)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Linked Accounts Section */}
      <section className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)] mb-4">
          {dict.settings.accounts.title}
        </h2>

        {unlinkError && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error-dark)] text-[13px] tracking-[-0.25px]">
            {unlinkError}
          </div>
        )}

        {loadingAccounts ? (
          <p className="text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
            {dict.common.loading}
          </p>
        ) : accounts.length === 0 ? (
          <p className="text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
            {dict.settings.accounts.noAccounts}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium tracking-[-0.3px] text-[var(--fg)]">
                    {providerLabels[account.provider] || account.provider}
                  </span>
                  <span className="text-[12px] text-[var(--fg-secondary)] tracking-[-0.2px]">
                    {account.providerAccountId}
                  </span>
                  {confirmUnlinkId === account.id && account.provider === 'telegram' && (
                    <span className="text-[12px] text-[var(--color-warning-dark)] tracking-[-0.2px] mt-1">
                      {dict.settings.accounts.twoFactorWarning}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleUnlink(account)}
                  disabled={unlinkingId === account.id}
                  className={`text-[13px] tracking-[-0.25px] font-medium px-3 py-1.5 rounded-full transition-all duration-[var(--transition-fast)] cursor-pointer ${
                    confirmUnlinkId === account.id
                      ? 'bg-[var(--color-error)] text-white'
                      : 'text-[var(--fg-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--bg-tertiary)]'
                  } disabled:opacity-50`}
                >
                  {unlinkingId === account.id
                    ? '...'
                    : confirmUnlinkId === account.id
                      ? dict.settings.accounts.unlinkConfirm
                      : dict.settings.accounts.unlink}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Back Link */}
      <div className="pt-2">
        <a
          href={`/${locale}`}
          className="text-[13px] tracking-[-0.25px] text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors duration-[var(--transition-fast)]"
        >
          {dict.settings.back}
        </a>
      </div>
    </div>
  );
}
