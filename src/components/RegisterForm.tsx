'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiPost } from '@/lib/api';

interface RegisterDict {
  title: string;
  email: string;
  name: string;
  namePlaceholder: string;
  password: string;
  submit: string;
  hasAccount: string;
  loginLink: string;
  error: {
    emailTaken: string;
    network: string;
    generic: string;
  };
}

interface RegisterFormProps {
  dict: RegisterDict;
  locale: string;
}

export function RegisterForm({ dict, locale }: RegisterFormProps) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiPost('/auth/register', {
        email,
        password,
        ...(name.trim() ? { name: name.trim() } : {}),
      });

      if (result.status === 0) {
        setError(dict.error.network);
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success — user is auto-logged in, redirect to home
      router.push(`/${locale}/`);
    } catch {
      setError(dict.error.generic);
    } finally {
      setLoading(false);
    }
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
          label={dict.name}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={dict.namePlaceholder}
          autoComplete="name"
          autoFocus
        />
        <Input
          label={dict.email}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label={dict.password}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
        />
        <Button type="submit" loading={loading} className="mt-2 w-full">
          {dict.submit}
        </Button>
      </form>

      <p className="mt-8 text-center text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
        {dict.hasAccount}{' '}
        <a
          href={`/${locale}/login`}
          className="text-[var(--fg)] font-medium hover:underline"
        >
          {dict.loginLink}
        </a>
      </p>
    </div>
  );
}
