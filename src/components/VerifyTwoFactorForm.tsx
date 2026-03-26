'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiPost } from '@/lib/api';

interface VerifyTwoFactorDict {
  twoFactor: {
    codeTitle: string;
    codeDescription: string;
    codePlaceholder: string;
    verifyButton: string;
    codeError: {
      invalid: string;
      expired: string;
      network: string;
    };
  };
}

interface VerifyTwoFactorFormProps {
  dict: VerifyTwoFactorDict;
  locale: string;
}

export function VerifyTwoFactorForm({ dict, locale }: VerifyTwoFactorFormProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const twoFactor = dict.twoFactor;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiPost('/auth/2fa/verify', { code });

      if (result.status === 0) {
        setError(twoFactor.codeError.network);
        return;
      }

      if (result.error) {
        if (result.error.toLowerCase().includes('expired')) {
          setError(twoFactor.codeError.expired);
        } else {
          setError(twoFactor.codeError.invalid);
        }
        return;
      }

      router.push(`/${locale}/`);
    } catch {
      setError(twoFactor.codeError.network);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <h1 className="text-[24px] font-semibold tracking-[-0.5px] text-[var(--fg)] mb-2">
        {twoFactor.codeTitle}
      </h1>
      <p className="text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px] mb-8">
        {twoFactor.codeDescription}
      </p>

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
          label={twoFactor.codeTitle}
          type="text"
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCode(v);
          }}
          placeholder={twoFactor.codePlaceholder}
          maxLength={6}
          pattern="[0-9]{6}"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
        />
        <Button type="submit" loading={loading} className="mt-2 w-full" disabled={code.length !== 6}>
          {twoFactor.verifyButton}
        </Button>
      </form>
    </div>
  );
}
