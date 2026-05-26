# KRYROS Admin Panel — Required Render Environment Variables

## Admin Panel (Frontend)

Set these in your Render dashboard under **Environment** for the admin panel service:

| Variable | Required | Example Value | Purpose |
|----------|----------|---------------|---------|
| `NEXT_PUBLIC_API_URL` | **YES** | `https://kryrosbackend-rwb2.onrender.com/api` | Your backend API base URL |
| `NEXT_PUBLIC_FRONTEND_URL` | No | `https://kryros-interface.onrender.com` | Customer-facing storefront URL |
| `NEXT_PUBLIC_ADMIN_URL` | No | `https://kryrosadmin-iqcj.onrender.com` | Admin panel URL (used for redirects/links) |
| `NODE_ENV` | Auto | `production` | Render sets this automatically |

> **Note:** `NEXT_PUBLIC_API_URL` must end in `/api` (e.g. `https://your-backend.onrender.com/api`)

## Backend API

Set these in your Render dashboard for the backend service:

| Variable | Required | Example Value | Purpose |
|----------|----------|---------------|---------|
| `DATABASE_URL` | **YES** | `postgresql://user:pass@host/db` | Neon/PostgreSQL connection string |
| `JWT_SECRET` | **YES** | `your-super-secret-jwt-key` | Signs access & refresh tokens |
| `REFRESH_SECRET` | **YES** | `your-refresh-secret-key` | Signs refresh tokens |
| `BCRYPT_ROUNDS` | No | `12` | Password hashing rounds |
| `PORT` | Auto | `3000` | Render overrides this automatically |
| `NODE_ENV` | Auto | `production` | Render sets this automatically |
| `CORS_ORIGINS` | No | `https://kryrosadmin-iqcj.onrender.com,https://kryros-interface.onrender.com` | Allowed frontend origins |
| `SENTRY_DSN` | No | `https://...@sentry.io/...` | Error tracking (optional) |
| `ADMIN_SEED_EMAIL` | No | `admin@kryros.com` | Initial super admin seed email |
| `ADMIN_SEED_PASSWORD` | No | `SecurePass123!` | Initial super admin seed password |
| `WHATSAPP_NUMBER` | No | `+260...` | WhatsApp integration number |

## What Changed (Why Login Was Breaking)

The **root cause** of the double-login bug was a mismatch between cookie lifetime and token lifetime:

- Backend signed JWT tokens with `expiresIn: '7d'` (7 days)
- Admin panel set the `admin_token` cookie with `maxAge: 60 * 15` (only 15 minutes)

This meant the browser deleted the cookie after 15 minutes, even though the token was still valid for 7 days. Every new page load after 15 minutes saw no cookie → redirected to `/login`.

**Fix applied:** Changed `maxAge` to `60 * 60 * 24 * 7` (7 days) in all auth routes and middleware.

## Quick Verification Checklist

Before deploying, verify on Render:

- [ ] `NEXT_PUBLIC_API_URL` points to your live backend (ends with `/api`)
- [ ] `JWT_SECRET` is set and matches between backend and admin panel
- [ ] Backend `DATABASE_URL` is correct and database is reachable
- [ ] Admin panel **Build Command** is set correctly (e.g. `npm run build` or `next build`)
- [ ] Admin panel **Start Command** is `next start -p $PORT`
