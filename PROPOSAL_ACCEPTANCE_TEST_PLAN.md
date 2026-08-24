# Proposal Acceptance Test Plan

1. Run `supabase/migrations/20260820_proposal_acceptance.sql`.
2. Generate a proposal from `/admin/proposals`.
3. In `/admin/clients/<client-id>` share the proposal with the test client.
4. Log into `/portal` as that client and open Proposals.
5. Open proposal details and confirm status changes from `shared` to `viewed`.
6. Request changes with a note; refresh admin and verify `changes_requested` and the response note.
7. Share/reset a second proposal and accept it; verify `accepted_at`, client activity and linked lead status `won`.
8. Test decline on a third proposal.
9. Log in as another client and verify they cannot act on another client's proposal ID.
