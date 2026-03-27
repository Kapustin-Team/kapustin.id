import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  images: {
    remotePatterns: [
      // Google avatars (Gmail, Google OAuth)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      // GitHub avatars (future)
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // Yandex avatars
      { protocol: 'https', hostname: 'avatars.yandex.net' },
      // Kapustin CDN / self-hosted uploads
      { protocol: 'https', hostname: 'api.kapustin.id' },
      { protocol: 'https', hostname: 'cdn.kapustin.id' },
    ],
  },
};

export default nextConfig;
