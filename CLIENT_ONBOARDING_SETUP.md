# DavidPilot Automated Client Onboarding

## 1. Database
Run `supabase/migrations/20260824_client_onboarding.sql` in Supabase SQL Editor.

## 2. Flow
Accepted proposals appear under Admin → Onboarding. Select one, review the project dates, and choose **Onboard client**.

DavidPilot will create or reuse the client workspace, create an initial project, link the accepted proposal, create the onboarding checklist, and create portal access when the client has no membership. For a newly created portal user it sends the existing secure Supabase password-reset/setup email.

## 3. Client Portal
The portal now includes an **Onboarding** tab. Clients can see onboarding progress but cannot modify tasks. Admin controls task state from Clients → client → Onboarding. When every task is completed the client status automatically moves from `onboarding` to `active`.

## 4. Required existing configuration
No new Vercel variables are required. Existing Supabase URL, service key, publishable key, and password-reset redirect configuration are reused.

## 5. Test
1. Use an accepted proposal.
2. Open Admin → Onboarding.
3. Select the accepted proposal and provision it.
4. Confirm client workspace and project were created/reused.
5. Open Clients → client → Onboarding and update checklist items.
6. Log into the Client Portal and verify the Onboarding tab.
7. Complete every task and confirm client status becomes Active.
