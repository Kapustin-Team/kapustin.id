'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', maxWidth: '400px' }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 500, borderRadius: '999px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
