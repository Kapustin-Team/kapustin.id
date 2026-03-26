'use client';

import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, icon, iconRight, className = '', id, ...props }, ref) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[var(--fg)] tracking-[-0.25px]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full border border-[var(--fg-muted)] bg-[var(--bg)] px-[15px] py-3 text-[13px] tracking-[-0.25px] text-[var(--fg-secondary)] placeholder:text-[var(--fg-muted)] transition-all duration-[var(--transition-fast)] focus:outline-none focus:border-[var(--fg)] rounded-full ${
              icon ? 'pl-10' : ''
            } ${iconRight ? 'pr-10' : ''} ${
              error
                ? 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                : ''
            } ${className}`}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p className="text-[13px] tracking-[-0.25px] text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  }
);
