# DavidPilot Analytics Dashboard

## Added

- Authenticated `/admin/analytics` dashboard.
- Public first-party analytics endpoint at `/api/analytics`.
- Admin reporting endpoint at `/api/admin/analytics`.
- Supabase `analytics_events` migration.
- Unique visitor and page-view tracking.
- AI chat open and message tracking.
- Booking-open tracking.
- Lead-source tracking for AI Chat, Contact Form and Public AI Copy Studio.
- Public AI Copy Studio generation tracking.
- Proposal-generation tracking.
- Lead-status-change tracking.
- Funnel, conversion rates, pipeline potential, lead score, trends, industries, services, language and source breakdowns.
- 7, 30, 90 and 365 day filters.
- Analytics navigation item across the admin workspaces.

## Notes

The first release is first-party and privacy-conscious: it stores product events in your own Supabase project. It does not add Google Analytics or Microsoft Clarity.

Cal.com booking completion is not automatically visible without a webhook/API integration. The dashboard therefore shows booking opens plus meetings marked as booked in Lead Cockpit.
