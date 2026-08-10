# Client Portal V1 Test Plan

1. Run `supabase/migrations/20260810_client_portal.sql`.
2. Deploy `feature/client-portal` as a Vercel Preview.
3. Sign into `/admin` and open `/admin/clients`.
4. Create a test company with a new test email and temporary password.
5. Open `/portal/login` in an incognito window and sign in with that client account.
6. Confirm `/portal` loads only that client's workspace.
7. Open Support and submit a test request. Confirm it appears in `support_requests` with the correct `client_id` and `created_by`.
8. In Supabase SQL Editor or Table Editor, add a test project for the created `client_id`; refresh the portal and verify it appears.
9. Create a second client account. Confirm the first user cannot see the second client's records and vice versa.
10. Confirm `/admin` still uses the existing admin password and is not affected by portal authentication.

Security test: never merge to production unless the two-client isolation test passes.
