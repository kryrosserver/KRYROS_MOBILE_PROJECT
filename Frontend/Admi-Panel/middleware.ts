// Next.js middleware entry point.
// Re-exports the proxy function from proxy.ts which:
//   - Injects Authorization: Bearer header from the httpOnly kryros_token cookie
//   - Handles admin route protection (redirects unauthenticated users to /login)
//   - Handles CORS and security headers
export { proxy as default, config } from './proxy';
