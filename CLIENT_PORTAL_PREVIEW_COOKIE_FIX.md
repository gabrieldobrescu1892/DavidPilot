# Client Portal Preview Cookie Fix

## Problem
Portal login returned HTTP 200 on Vercel Preview, but `/api/portal/dashboard` immediately returned 401.

## Cause
Vercel Preview runs with `NODE_ENV=production`. The previous cookie helper used `VERCEL_PROJECT_PRODUCTION_URL`, so it applied `Domain=.davidpilot.com` even when the browser was on a `*.vercel.app` Preview hostname. The browser rejected the cookie due to the domain mismatch.

## Fix
Cookie scope now uses the actual request hostname:

- `*.vercel.app`: host-only cookie
- `davidpilot.com` / `www.davidpilot.com`: shared `.davidpilot.com` cookie

Logout uses the same hostname-aware cookie settings.

## Test
1. Redeploy the Preview branch.
2. Open `/portal/login` in an incognito window.
3. Sign in.
4. Confirm `POST /api/portal/login` returns 200.
5. Confirm `GET /api/portal/dashboard` returns 200.
6. In DevTools > Application > Cookies, confirm `davidpilot_portal_access` exists for the Preview hostname.
