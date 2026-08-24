# Proposal Admin Sync Fix

- Maps accepted proposals to Lead Cockpit `customer` status (the valid CRM status) instead of the unsupported `won` value.
- Admin Proposal Generator refreshes proposal/lead state every 15 seconds and whenever the tab/window regains focus.
- Adds lifecycle status, timestamps, client response, and a manual Refresh status button to the proposal workspace.
- Existing accepted proposals display correctly after refresh; for acceptances created before this fix, update the linked lead manually to `customer` once if needed.
