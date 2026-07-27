# DavidPilot landing page

## Deploy on Vercel
1. Upload this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Add `davidpilot.com` and `www.davidpilot.com` under Project > Domains.
4. Add environment variables:
   - `N8N_WEBHOOK_URL`
   - `N8N_WEBHOOK_SECRET`
5. Redeploy.

The contact form posts to `/api/lead`, which securely forwards the lead to n8n.
