'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiPost } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface LoginDict {
  title: string;
  email: string;
  password: string;
  submit: string;
  googleButton: string;
  yandexButton: string;
  noAccount: string;
  registerLink: string;
  orSocial: string;
  error: {
    invalidCredentials: string;
    network: string;
    generic: string;
  };
}

interface LoginFormProps {
  dict: LoginDict;
  locale: string;
}

export function LoginForm({ dict, locale }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiPost('/auth/login', { email, password });

      if (result.status === 0) {
        setError(dict.error.network);
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success — redirect
      const destination = returnTo || `/${locale}/`;
      router.push(destination);
    } catch {
      setError(dict.error.generic);
    } finally {
      setLoading(false);
    }
  }

  function handleSocialLogin(provider: 'google' | 'yandex') {
    const returnPath = returnTo || `/${locale}/`;
    window.location.href = `${API_BASE_URL}/auth/${provider}?returnTo=${encodeURIComponent(returnPath)}`;
  }

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <h1 className="text-[24px] font-semibold tracking-[-0.5px] text-[var(--fg)] mb-8">
        {dict.title}
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 text-[13px] tracking-[-0.25px] rounded-2xl bg-[var(--color-error-bg,rgba(220,38,38,0.08))] text-[var(--color-error)] border border-[var(--color-error)]"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={dict.email}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
        <Input
          label={dict.password}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          minLength={8}
        />
        <Button type="submit" loading={loading} className="mt-2 w-full">
          {dict.submit}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[var(--border-color)]" />
        <span className="text-[13px] text-[var(--fg-muted)] tracking-[-0.25px]">
          {dict.orSocial}
        </span>
        <div className="flex-1 h-px bg-[var(--border-color)]" />
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('google')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="mr-1.5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {dict.googleButton}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('yandex')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="mr-1.5">
            <path fill="currentColor" d="M13.62 21V12.36L17.41 3H14.82L12.03 10.21L9.37 3H6.59L10.87 12.81V21H13.62Z"/>
          </svg>
          {dict.yandexButton}
        </Button>
      </div>

      <p className="mt-8 text-center text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
        {dict.noAccount}{' '}
        <a
          href={`/${locale}/register`}
          className="text-[var(--fg)] font-medium hover:underline"
        >
          {dict.registerLink}
        </a>
      </p>
    </div>
  );
}
