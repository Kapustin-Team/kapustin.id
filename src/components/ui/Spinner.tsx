type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const s = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: s, height: s }}
      role="status"
      aria-label="Loading"
    >
      <div
        className="rounded-full border-2 border-[var(--border-color)] border-t-[var(--fg)] animate-spin"
        style={{ width: s, height: s }}
      />
    </div>
  );
}
