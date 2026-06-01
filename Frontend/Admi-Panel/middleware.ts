import { proxy } from "./proxy";
import type { NextRequest } from "next/server";

// This file activates the proxy.ts logic as Next.js Edge Middleware.
// proxy.ts handles:
//   1. KRYROS admin route guard (kryros_token or kryros_admin_token cookie required)
//   2. Authorization: Bearer header injection from httpOnly kryros_token cookie
//   3. CodeWords preview auth (when CODEWORDS_ACCESS_TOKEN is set)
export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: "/:path*",
};
