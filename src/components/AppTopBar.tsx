'use client';

import Image from 'next/image';

interface AppTopBarProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  className?: string;
}

export function AppTopBar({ user, className = '' }: AppTopBarProps) {
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {/* Left side — empty or future breadcrumb */}
      <div />

      {/* Right side — user info + avatar */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-[13px] font-medium text-[var(--fg)] tracking-[-0.25px]">
            {user.name || user.email}
          </span>
          {user.name && (
            <span className="text-[11px] text-[var(--fg-muted)] tracking-[-0.2px]">
              {user.email}
            </span>
          )}
        </div>
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || user.email}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center">
            <span className="text-[11px] font-medium text-[var(--fg-secondary)] select-none">
              {initials}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
