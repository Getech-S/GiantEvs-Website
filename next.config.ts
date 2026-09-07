import type { NextConfig } from 'next';

/**
 * Headers that are identical for every response live here; the
 * per-request Content-Security-Policy (which carries a fresh nonce)
 * is emitted from `src/proxy.ts` instead.
 */
const securityHeaders = [
  // Opt out of Google's FLoC/Topics and lock down powerful browser APIs we never use.
  {
    key: 'Permissions-Policy',
    value: [
      'accelerometer=()',
      'autoplay=(self)',
      'browsing-topics=()',
      'camera=()',
      'display-capture=()',
      'geolocation=(self)',
      'gyroscope=()',
      'interest-cohort=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', '),
  },
  // 2 years, matching the hstspreload.org submission requirements.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework version to scanners.
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Admin-uploaded news images live in Vercel Blob (see
    // src/app/api/admin/upload/route.ts) rather than /public, so next/image
    // needs an explicit remote pattern to optimise them. Keep this in sync
    // with the CSP img-src entry in src/proxy.ts.
    remotePatterns: [{ protocol: 'https', hostname: '**.public.blob.vercel-storage.com' }],
    // Block SVG rasterisation outright — nothing we load needs it.
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Fingerprinted brand + media assets can be cached hard.
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
