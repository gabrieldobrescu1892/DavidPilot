# DAVIDPILOT — Enterprise AI Engineering

Full bilingual Next.js repository for davidpilot.com.

## Included

- Premium bilingual English/Romanian public website
- Floating OpenAI-powered AI consultant on every public page
- Conversation persistence, lead qualification state and consultation CTA
- Supabase lead storage
- Admin login and lead dashboard
- Solutions, About, Resources and Contact pages
- Sitemap, robots and localized interface copy
- No Tailwind or PostCSS dependency

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local`.
3. Fill in the required environment variables.
4. Run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Vercel environment variables

```text
OPENAI_API_KEY
OPENAI_CHAT_MODEL
SUPABASE_URL
SUPABASE_SECRET_KEY
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
NEXT_PUBLIC_SITE_URL
```

`SUPABASE_SERVICE_ROLE_KEY` can be used instead of `SUPABASE_SECRET_KEY`.

## Deployment

- `main` branch: production
- `develop` branch: test/preview

Upload the contents of this folder to the GitHub repository root. `package.json` must remain at the repository root.

When replacing an older repository, remove obsolete files such as `postcss.config.mjs` and `tailwind.config.*` before committing.

## DavidPilot V3 homepage additions

- Complete bilingual EN/RO homepage copy
- Premium benefit-led hero and trust strip
- Why DavidPilot section
- Redesigned Investment section
- Interactive AI ROI estimator
- Featured AI Solutions examples
- Four-step How We Work section
- Updated navigation anchors
- Responsive styling for desktop and mobile

The ROI calculator provides indicative estimates only and does not present guaranteed savings.
