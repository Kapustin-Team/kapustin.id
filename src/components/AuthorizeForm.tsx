'use client';

import { Button } from '@/components/ui/Button';
import { API_BASE_URL } from '@/lib/api';

interface AuthorizeDict {
  title: string;
  requestingAccess: string;
  scope: string;
  allowButton: string;
  denyButton: string;
}

interface AuthorizeFormProps {
  dict: AuthorizeDict;
  clientId: string;
  clientName: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}

export function AuthorizeForm({
  dict,
  clientId,
  clientName,
  redirectUri,
  scope,
  state,
  codeChallenge,
  codeChallengeMethod,
}: AuthorizeFormProps) {
  const displayName = clientName || 'Unknown application';
  const displayScope = scope || 'basic profile';

  function handleAllow() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      state: state,
      consent: 'granted',
      ...(scope ? { scope } : {}),
    });
    window.location.href = `${API_BASE_URL}/oauth/authorize?${params.toString()}`;
  }

  function handleDeny() {
    const denyUrl = new URL(redirectUri);
    denyUrl.searchParams.set('error', 'access_denied');
    denyUrl.searchParams.set('state', state);
    window.location.href = denyUrl.toString();
  }

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <h1 className="text-[24px] font-semibold tracking-[-0.5px] text-[var(--fg)] mb-6">
        {dict.title}
      </h1>

      <div className="mb-6 px-4 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <p className="text-[14px] text-[var(--fg)] tracking-[-0.25px] leading-relaxed">
          <span className="font-semibold">{displayName}</span>{' '}
          {dict.requestingAccess}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-[13px] font-medium text-[var(--fg-secondary)] tracking-[-0.25px] mb-2">
          {dict.scope}
        </h2>
        <div className="px-4 py-3 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <p className="text-[13px] text-[var(--fg)] tracking-[-0.25px]">
            {displayScope}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={handleAllow}
        >
          {dict.allowButton}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDeny}
        >
          {dict.denyButton}
        </Button>
      </div>
    </div>
  );
}
