import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-rwb2.onrender.com";
    return [
      { source: "/api/auth/:path*", destination: `${backendUrl}/api/auth/:path*` },
      { source: "/api/orders", destination: `${backendUrl}/api/orders` },
      { source: "/api/orders/:path*", destination: `${backendUrl}/api/orders/:path*` },
      { source: "/api/products", destination: `${backendUrl}/api/products` },
      { source: "/api/products/:path*", destination: `${backendUrl}/api/products/:path*` },
      { source: "/api/users", destination: `${backendUrl}/api/users` },
      { source: "/api/users/:path*", destination: `${backendUrl}/api/users/:path*` },
      { source: "/api/categories", destination: `${backendUrl}/api/categories` },
      { source: "/api/categories/:path*", destination: `${backendUrl}/api/categories/:path*` },
      { source: "/api/brands", destination: `${backendUrl}/api/brands` },
      { source: "/api/brands/:path*", destination: `${backendUrl}/api/brands/:path*` },
      { source: "/api/reviews", destination: `${backendUrl}/api/reviews` },
      { source: "/api/reviews/:path*", destination: `${backendUrl}/api/reviews/:path*` },
    ];
  },
};

export default nextConfig;
