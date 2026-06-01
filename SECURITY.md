# Security Configuration Guide

This document lists all environment variables required for secure deployment
and post-audit action items.

---

## 🔴 Immediate Action Required

### 1. Rotate Firebase API Key
The Firebase API key was previously committed to git history.
Even after this fix, the old key in git history must be rotated:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Find the Firebase API key for project `notification-237bf`
4. Click **Regenerate** or **Delete** and create a new key
5. Apply restrictions: HTTP referrers (your domain only) + Firebase APIs only
6. Update the key in your deployment environment variables (see below)

### 2. Purge google-services.json from Git History
```bash
# Install git-filter-repo first: pip install git-filter-repo
git filter-repo --path kryros_mobile_app/android/app/google-services.json --invert-paths
# Force-push: git push origin main --force
# Tell all contributors to re-clone
```

---

## Required Environment Variables

### Backend (Render)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Required | PostgreSQL connection string |
| `JWT_SECRET` | ✅ Required | Min 32 chars random string for JWT signing |
| `NODE_ENV` | ✅ Required | Set to `production` on Render |
| `REDIS_URL` | ✅ Required | Redis connection URL for rate limiting + lockout |
| `CORS_ORIGINS` | ✅ Required | Comma-separated allowed origins |
| `CLOUDINARY_CLOUD_NAME` | ✅ Required | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ Required | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ Required | From Cloudinary dashboard |
| `ADMIN_SEED_EMAIL` | Optional | Initial super admin email |
| `ADMIN_SEED_PASSWORD` | Optional | Initial super admin password (min 8 chars) |
| `SENTRY_DSN` | Optional | Sentry error tracking DSN |

### Admin Panel (Render/Vercel)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Required | Backend URL, e.g. `https://your-backend.onrender.com` |
| `NODE_ENV` | ✅ Required | Set to `production` |

### Flutter Mobile App (CI/CD Build)

| Variable | Required | Description |
|---|---|---|
| `FIREBASE_API_KEY` | ✅ Required | Firebase Web API key |
| `FIREBASE_AUTH_DOMAIN` | ✅ Required | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | ✅ Required | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | ✅ Required | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | ✅ Required | Firebase sender ID |
| `FIREBASE_APP_ID` | ✅ Required | Firebase app ID |
| `FIREBASE_VAPID_KEY` | ✅ Required | Web push VAPID key from Firebase Console |

Inject into `kryros_mobile_app/web/index.html` at build time:
```bash
# In your CI/CD pipeline:
envsubst < web/index.html.template > web/index.html
```

### GitHub Actions Secrets

| Secret | Description |
|---|---|
| `SNYK_TOKEN` | Snyk API token for dependency scanning (free tier at snyk.io) |

---

## Redis Setup (Required for Production)

Get a free Redis instance from:
- [Upstash](https://upstash.com) — serverless Redis, free tier, low latency
- [Redis Cloud](https://redis.io/cloud/) — free 30MB tier
- [Render Redis](https://render.com/docs/redis) — paid add-on

After provisioning, set `REDIS_URL` in your Render backend service environment.

---

## Firebase Security Hardening

1. **Restrict API key** in Google Cloud Console → APIs & Services → Credentials:
   - Application restrictions: HTTP referrers → `https://kryros.com/*`
   - API restrictions: Firebase APIs only
   
2. **Enable Firebase App Check**: Firebase Console → App Check → Register apps

3. **Review Firebase Security Rules**: Ensure Firestore/Storage rules require authentication

---

## Security Scan Status

| Check | Tool | Status |
|---|---|---|
| Dependency vulnerabilities | Snyk | CI (setup SNYK_TOKEN) |
| Secret scanning | Gitleaks | CI (automatic) |
| Static analysis | eslint-plugin-security | CI (automatic) |
| Dependency updates | Dependabot | Active |
