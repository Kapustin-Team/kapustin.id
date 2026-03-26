'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--fg)] text-white border border-white hover:opacity-90 active:opacity-80 shadow-[var(--shadow-sm)]',
  secondary:
    'bg-[var(--bg-tertiary)] text-[var(--fg)] hover:bg-[var(--border-color)] active:bg-[var(--border-color-strong)]',
  outline:
    'border border-[var(--fg-secondary)] text-[var(--fg-secondary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-color)]',
  ghost:
    'text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-color)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-[13px] px-4 py-2 gap-1.5 rounded-full tracking-[-0.25px]',
  md: 'text-[13px] px-4 py-2 gap-2 rounded-full tracking-[-0.25px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-[var(--transition-fast)] cursor-pointer select-none whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
      {iconRight}
    </button>
  );
}
