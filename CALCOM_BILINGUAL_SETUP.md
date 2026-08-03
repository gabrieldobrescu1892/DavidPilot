# Bilingual Cal.com setup

Create two separate 30-minute Cal.com event types:

## English event
- Suggested title: `Enterprise AI Strategy Session`
- Suggested slug: `enterprise-ai-strategy-session`
- Example URL: `https://cal.com/gabriel-dobrescu/enterprise-ai-strategy-session`

## Romanian event
- Suggested title: `Sesiune Strategică AI`
- Suggested slug: `sesiune-strategica-ai`
- Example URL: `https://cal.com/gabriel-dobrescu/sesiune-strategica-ai`

Both events can use the same Google Meet integration and availability schedule. Localize the title, description, and booking questions inside Cal.com.

## Vercel environment variables

Add these under Project > Settings > Environment Variables:

```env
NEXT_PUBLIC_CAL_LINK_EN=https://cal.com/gabriel-dobrescu/enterprise-ai-strategy-session
NEXT_PUBLIC_CAL_LINK_RO=https://cal.com/gabriel-dobrescu/sesiune-strategica-ai
```

Enable them for Production and Preview, save, and redeploy.

The website automatically selects the Romanian event when the site language is RO and the English event when it is EN. The old `NEXT_PUBLIC_CAL_LINK` variable remains an optional fallback.
