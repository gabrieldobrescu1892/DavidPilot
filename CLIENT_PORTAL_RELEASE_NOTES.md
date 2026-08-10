# DavidPilot Client Portal V1

Adds a separate authenticated client workspace without changing the existing DavidPilot admin authentication.

## Client routes
- `/portal/login` – client login using Supabase Auth
- `/portal` – private client workspace

## Portal modules
- Overview
- Projects and milestones
- Meetings
- Documents
- Proposals
- Support requests
- Recent client activity

## Admin
- `/admin/clients` creates client workspaces and Supabase Auth users.
- Admin navigation now includes Clients.

## Security
- Client accounts use Supabase Auth, not `ADMIN_PASSWORD`.
- Row Level Security restricts all portal records to the authenticated user's assigned client workspace.
- Portal access token is kept in an HTTP-only cookie.
- Existing server-side admin functionality continues using the Supabase secret key.

## Current V1 limitations
- Admin creates a temporary password manually. Invitation/password-reset email UX is planned for V2.
- Documents are URL-backed metadata in V1. Supabase Storage upload is planned for V2.
- Projects, meetings and documents currently rely on records inserted by admin/database workflows; a richer admin project editor is planned for V2.
