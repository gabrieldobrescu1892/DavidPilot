# Proposal Sharing + Client Acceptance

Adds a complete client proposal lifecycle to DavidPilot.

- Proposal states: draft, shared, viewed, changes_requested, accepted, declined.
- Client Portal can open full proposal details.
- Client can accept, request changes with a note, or decline.
- Proposal view/response timestamps are persisted.
- Client activity records proposal actions.
- Accepted proposals update the linked lead to `won`.
- Requested changes return the linked lead to `proposal_sent`.
- Existing proposal generation, PDF export, Client Portal, Cal.com sync and analytics remain intact.
