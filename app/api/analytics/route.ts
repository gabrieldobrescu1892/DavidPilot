import { NextRequest, NextResponse } from "next/server";
import { insertAnalyticsEvent } from "@/lib/supabase-rest";

export const runtime = "nodejs";

const allowedEvents = new Set([
  "page_view",
  "chat_opened",
  "chat_message_sent",
  "booking_opened",
  "lead_submitted",
  "copy_trial_generated",
  "contact_form_submitted",
  "proposal_generated",
  "lead_status_changed",
]);

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const eventName = clean(body.event_name, 80);
  if (!allowedEvents.has(eventName)) return NextResponse.json({ ok: false }, { status: 400 });

  const metadata = body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
    ? body.metadata as Record<string, unknown>
    : {};

  try {
    await insertAnalyticsEvent({
      event_name: eventName,
      session_id: clean(body.session_id, 120) || null,
      lead_id: clean(body.lead_id, 80) || null,
      language: body.language === "ro" ? "ro" : body.language === "en" ? "en" : null,
      source: clean(body.source, 80) || null,
      page: clean(body.page, 300) || null,
      metadata,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics event insert failed", error);
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
