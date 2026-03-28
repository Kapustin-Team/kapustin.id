import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').origin;

const imageOrigins = Array.from(new Set([
  apiOrigin,
  'https://lh3.googleusercontent.com',
  'https://lh4.googleusercontent.com',
  'https://lh5.googleusercontent.com',
  'https://lh6.googleusercontent.com',
  'https://avatars.githubusercontent.com',
  'https://avatars.yandex.net',
  'https://api.kapustin.id',
  'https://cdn.kapustin.id',
]));

const connectOrigins = Array.from(new Set([
  apiOrigin,
  'http://localhost:3001',
  'https://api.kapustin.id',
  'ws:',
  'wss:',
]));

// This app is statically rendered with App Router pages. Next.js nonce-based CSP
// requires dynamic rendering, so we keep a CSP that is compatible with the
// current static HTML profile while still locking down origins and browser
// capabilities. The remaining inline allowances are intentional and should be
// revisited only if the app moves to request-time rendering.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${imageOrigins.join(' ')}`,
  "font-src 'self'",
  `connect-src 'self' ${connectOrigins.join(' ')}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
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
  poweredByHeader: false,

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
      { protocol: 'https', hostname: 'cdn.kpstn.ru' },
    ],
  },
};

export default nextConfig;
