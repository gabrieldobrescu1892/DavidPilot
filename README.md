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


## Leadership
The former About page is now available at `/leadership`. `/about` redirects permanently to the new route. The AI chat remains branded as **DavidPilot AI Consultant** in both languages.


## Cal.com booking

1. Create a 30-minute event in Cal.com, for example `AI Strategy Session`.
2. Connect the calendar used to detect availability and configure Google Meet or Microsoft Teams.
3. In Vercel, add the environment variable:

```env
NEXT_PUBLIC_CAL_LINK_EN=https://cal.com/your-username/enterprise-ai-strategy-session
NEXT_PUBLIC_CAL_LINK_RO=https://cal.com/your-username/sesiune-strategica-ai
```

4. Apply it to Production and Preview, then redeploy.

All strategy-session buttons open this event in a premium on-site modal. The contact page remains available for visitors who prefer a written enquiry.


See `CALCOM_BILINGUAL_SETUP.md` for the bilingual event configuration.
