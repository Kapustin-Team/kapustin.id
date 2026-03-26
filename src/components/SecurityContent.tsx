'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiDelete, apiPost } from '@/lib/api';

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

interface LoginEvent {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  provider: string;
  success: boolean;
  reason: string | null;
  createdAt: string;
}

interface TwoFactorStatus {
  enabled: boolean;
  telegramLinked: boolean;
  telegramUsername?: string;
}

interface SecurityContentProps {
  dict: {
    twoFactor: {
      sectionTitle: string;
      linkTelegram: string;
      unlinkTelegram: string;
      telegramLinked: string;
      telegramNotLinked: string;
      enable2fa: string;
      disable2fa: string;
      twoFactorEnabled: string;
      twoFactorDisabled: string;
      linkFirst: string;
      openInTelegram: string;
    };
    security: {
      title: string;
      activeSessions: string;
      currentSession: string;
      terminateSession: string;
      terminateConfirm: string;
      loginHistory: string;
      ip: string;
      device: string;
      lastActive: string;
      loggedIn: string;
      provider: string;
      success: string;
      failed: string;
      noSessions: string;
      noHistory: string;
      back: string;
    };
    common: {
      loading: string;
      error: string;
    };
  };
  locale: string;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown';

  let browser = 'Unknown browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  let os = '';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';

  return os ? `${browser} on ${os}` : browser;
}

function formatRelativeTime(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  if (diffHour < 24) return rtf.format(-diffHour, 'hour');
  return rtf.format(-diffDay, 'day');
}

function formatDateTime(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr));
}

export function SecurityContent({ dict, locale }: SecurityContentProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [terminateError, setTerminateError] = useState<string | null>(null);
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [telegramLinkUrl, setTelegramLinkUrl] = useState<string | null>(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [sessionsRes, historyRes, twoFactorRes] = await Promise.all([
        apiGet<{ sessions: Session[] }>('/auth/sessions'),
        apiGet<{ events: LoginEvent[] }>('/auth/login-history'),
        apiGet<TwoFactorStatus>('/auth/2fa/status'),
      ]);

      if (sessionsRes.status === 401 || historyRes.status === 401) {
        window.location.href = `/${locale}/login`;
        return;
      }

      if (sessionsRes.error || historyRes.error) {
        setError(sessionsRes.error || historyRes.error || dict.common.error);
        setLoading(false);
        return;
      }

      setSessions(sessionsRes.data?.sessions ?? []);
      setEvents(historyRes.data?.events ?? []);
      if (twoFactorRes.data) {
        setTwoFactorStatus(twoFactorRes.data);
      }
      setLoading(false);
    }

    load();
  }, [locale, dict.common.error]);

  const handleTerminate = useCallback(
    async (id: string) => {
      setTerminatingId(id);
      setTerminateError(null);

      const res = await apiDelete(`/auth/sessions/${id}`);
      if (res.error) {
        setTerminateError(res.error);
        setTerminatingId(null);
        setConfirmingId(null);
        return;
      }

      setSessions((prev) => prev.filter((s) => s.id !== id));
      setTerminatingId(null);
      setConfirmingId(null);
    },
    [],
  );

  const handleLinkTelegram = useCallback(async () => {
    setTwoFactorLoading(true);
    const res = await apiPost<{ linkUrl: string }>('/auth/2fa/link-telegram', {});
    setTwoFactorLoading(false);

    if (res.error) return;
    if (res.data?.linkUrl) {
      setTelegramLinkUrl(res.data.linkUrl);
    }
  }, []);

  const handleEnable2FA = useCallback(async () => {
    setTwoFactorLoading(true);
    const res = await apiPost('/auth/2fa/enable', {});
    setTwoFactorLoading(false);

    if (res.error) return;
    setTwoFactorStatus((prev) =>
      prev ? { ...prev, enabled: true } : prev
    );
  }, []);

  const handleDisable2FA = useCallback(async () => {
    setTwoFactorLoading(true);
    const res = await apiPost('/auth/2fa/disable', {});
    setTwoFactorLoading(false);

    if (res.error) return;
    setTwoFactorStatus((prev) =>
      prev ? { ...prev, enabled: false } : prev
    );
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[640px] py-12 text-center">
        <p className="text-[var(--fg-secondary)] text-[13px] tracking-[-0.25px]">
          {dict.common.loading}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[640px] py-12 text-center">
        <p className="text-red-500 text-[13px] tracking-[-0.25px]">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[640px] flex flex-col gap-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold tracking-[-0.4px] text-[var(--fg)]">
          {dict.security.title}
        </h1>
        <a
          href={`/${locale}`}
          className="text-[13px] tracking-[-0.25px] text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors duration-[var(--transition-fast)]"
        >
          {dict.security.back}
        </a>
      </div>

      {/* Two-Factor Authentication */}
      {twoFactorStatus && (
        <section className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)]">
            {dict.twoFactor.sectionTitle}
          </h2>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col gap-3">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] tracking-[-0.2px] px-2 py-0.5 rounded-full font-medium ${
                  twoFactorStatus.enabled
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-[var(--bg-tertiary)] text-[var(--fg-secondary)]'
                }`}
              >
                {twoFactorStatus.enabled
                  ? dict.twoFactor.twoFactorEnabled
                  : dict.twoFactor.twoFactorDisabled}
              </span>
            </div>

            {/* Telegram link status */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] tracking-[-0.25px] text-[var(--fg-secondary)]">
                {twoFactorStatus.telegramLinked
                  ? dict.twoFactor.telegramLinked
                  : dict.twoFactor.telegramNotLinked}
              </span>
              {twoFactorStatus.telegramLinked && twoFactorStatus.telegramUsername && (
                <span className="text-[12px] tracking-[-0.2px] text-[var(--fg-muted)]">
                  @{twoFactorStatus.telegramUsername}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {!twoFactorStatus.telegramLinked && (
                <button
                  onClick={handleLinkTelegram}
                  disabled={twoFactorLoading}
                  className="text-[13px] tracking-[-0.25px] font-medium text-[var(--fg)] hover:opacity-70 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {dict.twoFactor.linkTelegram}
                </button>
              )}

              {twoFactorStatus.telegramLinked && !twoFactorStatus.enabled && (
                <button
                  onClick={handleEnable2FA}
                  disabled={twoFactorLoading}
                  className="text-[13px] tracking-[-0.25px] font-medium text-[var(--fg)] hover:opacity-70 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {dict.twoFactor.enable2fa}
                </button>
              )}

              {twoFactorStatus.enabled && (
                <button
                  onClick={handleDisable2FA}
                  disabled={twoFactorLoading}
                  className="text-[13px] tracking-[-0.25px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {dict.twoFactor.disable2fa}
                </button>
              )}

              {!twoFactorStatus.telegramLinked && (
                <span className="text-[12px] tracking-[-0.2px] text-[var(--fg-muted)]">
                  {dict.twoFactor.linkFirst}
                </span>
              )}
            </div>

            {/* Telegram deep link URL */}
            {telegramLinkUrl && (
              <div className="mt-2 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border-color)]">
                <p className="text-[12px] text-[var(--fg-secondary)] tracking-[-0.2px] mb-2">
                  {dict.twoFactor.openInTelegram}
                </p>
                <a
                  href={telegramLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] tracking-[-0.25px] text-blue-500 hover:text-blue-600 break-all"
                >
                  {telegramLinkUrl}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Active Sessions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)]">
          {dict.security.activeSessions}
        </h2>

        {sessions.length === 0 ? (
          <p className="text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
            {dict.security.noSessions}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-xl border bg-[var(--bg-secondary)] ${
                  session.isCurrent
                    ? 'border-[var(--fg)]'
                    : 'border-[var(--border-color)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium tracking-[-0.3px] text-[var(--fg)]">
                        {parseUserAgent(session.userAgent)}
                      </span>
                      {session.isCurrent && (
                        <span className="text-[11px] tracking-[-0.2px] px-2 py-0.5 rounded-full bg-[var(--fg)] text-white font-medium">
                          {dict.security.currentSession}
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-[var(--fg-secondary)] tracking-[-0.2px]">
                      {dict.security.ip}: {session.ipAddress || '—'}
                    </span>
                    <span className="text-[12px] text-[var(--fg-secondary)] tracking-[-0.2px]">
                      {dict.security.lastActive}: {formatRelativeTime(session.lastActive, locale)}
                    </span>
                    <span className="text-[12px] text-[var(--fg-secondary)] tracking-[-0.2px]">
                      {dict.security.loggedIn}: {formatDateTime(session.createdAt, locale)}
                    </span>
                  </div>

                  {!session.isCurrent && (
                    <div className="flex-shrink-0">
                      {confirmingId === session.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-[var(--fg-secondary)] tracking-[-0.2px]">
                            {dict.security.terminateConfirm}
                          </span>
                          <button
                            onClick={() => handleTerminate(session.id)}
                            disabled={terminatingId === session.id}
                            className="text-[12px] tracking-[-0.2px] text-red-500 hover:text-red-600 font-medium cursor-pointer disabled:opacity-50"
                          >
                            {terminatingId === session.id ? '...' : dict.security.terminateSession}
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="text-[12px] tracking-[-0.2px] text-[var(--fg-secondary)] hover:text-[var(--fg)] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setTerminateError(null);
                            setConfirmingId(session.id);
                          }}
                          className="text-[12px] tracking-[-0.2px] text-red-500 hover:text-red-600 font-medium cursor-pointer"
                        >
                          {dict.security.terminateSession}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {terminateError && confirmingId === session.id && (
                  <p className="mt-2 text-[12px] text-red-500 tracking-[-0.2px]">
                    {terminateError}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Login History */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)]">
          {dict.security.loginHistory}
        </h2>

        {events.length === 0 ? (
          <p className="text-[13px] text-[var(--fg-secondary)] tracking-[-0.25px]">
            {dict.security.noHistory}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
            <table className="w-full text-[13px] tracking-[-0.25px]">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--fg-secondary)]">
                    {dict.security.loggedIn}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--fg-secondary)]">
                    {dict.security.ip}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--fg-secondary)] hidden sm:table-cell">
                    {dict.security.device}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--fg-secondary)]">
                    {dict.security.provider}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--fg-secondary)]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-[var(--border-color)] last:border-b-0"
                  >
                    <td className="px-4 py-3 text-[var(--fg)]">
                      {formatDateTime(event.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3 text-[var(--fg-secondary)]">
                      {event.ipAddress || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--fg-secondary)] hidden sm:table-cell">
                      {parseUserAgent(event.userAgent)}
                    </td>
                    <td className="px-4 py-3 text-[var(--fg-secondary)] capitalize">
                      {event.provider}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex text-[11px] tracking-[-0.2px] px-2 py-0.5 rounded-full font-medium ${
                          event.success
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {event.success ? dict.security.success : dict.security.failed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
