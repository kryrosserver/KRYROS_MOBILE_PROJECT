import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer privacy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable sensitive browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Strict Content Security Policy for admin panel
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval'",   // unsafe-eval needed by Next.js dev HMR
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // ── API Proxy — forward /api/* to the NestJS backend ─────────────────────
  async rewrites() {
    // Strip trailing /api to prevent double /api/api/... paths
    const backendUrl = (
      process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-rwb2.onrender.com"
    ).replace(/\/api$/, "");

    const proxy = (seg: string) => [
      { source: `/api/${seg}`, destination: `${backendUrl}/api/${seg}` },
      { source: `/api/${seg}/:rest*`, destination: `${backendUrl}/api/${seg}/:rest*` },
    ];

    return [
      ...proxy("auth"),
      ...proxy("orders"),
      ...proxy("products"),
      ...proxy("users"),
      ...proxy("categories"),
      ...proxy("brands"),
      ...proxy("reviews"),
      ...proxy("reports"),
      ...proxy("cms"),
      ...proxy("services"),
      ...proxy("settings"),
      ...proxy("shipping"),
      ...proxy("shipping-zones"),
      ...proxy("countries"),
      ...proxy("states"),
      ...proxy("cities"),
      ...proxy("credit"),
      ...proxy("wallet"),
      ...proxy("wholesale"),
      ...proxy("wishlist"),
      ...proxy("notifications"),
      ...proxy("newsletter"),
      ...proxy("payments"),
      ...proxy("payment-config"),
    ];
  },
};

export default nextConfig;
