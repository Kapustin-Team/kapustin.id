import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Client — Kapustin ID SSO',
  description: 'Test client for verifying Kapustin ID OAuth/SSO flow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: '2rem' }}>
        {children}
      </body>
    </html>
  );
}
