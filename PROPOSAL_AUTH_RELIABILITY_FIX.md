# Proposal authentication and reliability fix

## Changes

- Admin cookie is shared between `davidpilot.com` and `www.davidpilot.com`.
- Admin fetches explicitly include credentials.
- Cookie SameSite changed from strict to lax for reliable first-party navigation.
- Proposal generation retries temporary OpenAI 429/502/503/overload responses.
- Proposal generation can fall back to `OPENAI_PROPOSAL_FALLBACK_MODEL`.
- Server logs now preserve useful OpenAI error details.

## Optional Vercel variable

```env
OPENAI_PROPOSAL_FALLBACK_MODEL=gpt-4.1-mini
```

After deployment, sign out and sign in again so the browser receives the new domain-wide cookie.
