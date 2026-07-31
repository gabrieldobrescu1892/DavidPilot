# DAVIDPILOT V2 — Enterprise AI Engineering

Premium bilingual Next.js website for DavidPilot.

## Included
- Premium responsive homepage
- English / Romanian language switcher (saved in localStorage)
- Solutions, About, Resources and Contact pages
- OpenAI consultant chat using the existing `/api/chat` route
- Supabase lead capture using the existing `/api/leads` route
- Existing admin dashboard and authentication
- Sitemap, robots and Open Graph metadata

## Vercel environment variables
Keep the existing values configured in Vercel:
- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `RESEND_API_KEY` (when email notifications are enabled)

## Deploy
Upload the repository contents to GitHub. `package.json` must remain at the repository root. Vercel Root Directory should be empty or `./`.
