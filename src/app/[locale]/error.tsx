'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
      <h2 className="text-[18px] font-semibold text-[var(--fg)] tracking-[-0.5px]">
        Something went wrong
      </h2>
      <p className="text-[14px] text-[var(--fg-secondary)] text-center max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-[13px] font-medium rounded-full bg-[var(--fg)] text-white hover:opacity-90 transition-opacity cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
