// Re-export the Kryros proxy logic as the Next.js middleware entry point.
//
// proxy.ts provides:
//   • Route protection — redirects to /login if no auth cookie present
//   • Authorization header injection — reads the httpOnly kryros_token cookie
//     and injects "Authorization: Bearer <token>" for every proxied API call
//     so JavaScript can NEVER access the token directly.
//
// This file must be named "middleware.ts" (Next.js convention).
// proxy.ts is kept as a separate file so it can be tested independently.

export { proxy as middleware, config } from "./proxy";
