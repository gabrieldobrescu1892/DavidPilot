# Chat → Lead → Booking flow

The AI consultant now follows this sequence:

1. Qualifies the visitor through `/api/chat`.
2. Displays a bilingual contact form when `lead.qualified` becomes true.
3. Sends the details, lead data, and recent conversation to `POST /api/leads`.
4. Shows the Cal.com booking button only after Supabase confirms the lead was saved.
5. The saved lead becomes visible in `/admin`.

## Production test

- Complete a qualified chat.
- Submit the contact form.
- In DevTools, confirm `POST /api/leads` returns `200`.
- Confirm a new row appears in Supabase `public.leads`.
- Confirm the same row appears in `/admin`.
- Click the booking button and complete a Cal.com test booking.

`SUPABASE_SECRET_KEY` should remain Sensitive in Vercel.
