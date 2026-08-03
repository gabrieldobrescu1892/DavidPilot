# Cal.com setup for DavidPilot

## 1. Create the event

Create a 30-minute event in Cal.com named **Free AI Strategy Session**.

Recommended URL slug:

```text
ai-strategy-session
```

Recommended description:

> A focused 30-minute discussion about your current business challenges, the highest-impact AI opportunities, implementation options and practical next steps.

Recommended booking questions:

- Name
- Business email
- Company
- Phone / WhatsApp
- Industry
- What would you like to automate or improve?
- Company website (optional)

Connect Google Calendar or Microsoft 365 so Cal.com can check your real availability. Configure Google Meet, Microsoft Teams, or Zoom as the meeting location.

## 2. Copy the public event URL

It should look like:

```text
https://cal.com/your-username/ai-strategy-session
```

## 3. Configure Vercel

Open:

```text
Vercel → Project → Settings → Environment Variables
```

Add:

```env
NEXT_PUBLIC_CAL_LINK=https://cal.com/your-username/ai-strategy-session
```

Enable it for **Production**, **Preview**, and **Development** as needed, then redeploy.

## 4. Test

Test these locations in both English and Romanian:

- Header strategy-session button
- Mobile navigation CTA
- Homepage hero
- Investment cards
- ROI section
- Featured solution cards
- Final homepage CTA
- Solutions-page CTA
- Qualified AI-consultant booking CTA

The contact page remains available for visitors who prefer a written enquiry.
