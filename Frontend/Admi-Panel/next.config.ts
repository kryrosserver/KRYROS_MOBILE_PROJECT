import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
