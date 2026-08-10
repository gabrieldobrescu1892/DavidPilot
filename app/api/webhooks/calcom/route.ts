import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  calWebhookEventExists,
  findClientByEmail,
  findLeadByEmail,
  insertAnalyticsEvent,
  insertClientActivityEvent,
  markCalClientMeeting,
  registerCalWebhookEvent,
  updateLeadBookingSync,
  upsertCalClientMeeting,
} from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Person = { name?: string; email?: string; timeZone?: string };
type BookingPayload = {
  uid?: string;
  rescheduleUid?: string;
  title?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: Person[];
  organizer?: Person;
  cancellationReason?: string;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

type WebhookEnvelope = {
  triggerEvent?: string;
  createdAt?: string;
  payload?: BookingPayload;
  [key: string]: unknown;
};

function verifySignature(raw: string, signature: string | null) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("CALCOM_WEBHOOK_SECRET is not configured.");
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(signature.trim(), "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function cleanEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function bookingData(envelope: WebhookEnvelope) {
  // BOOKING_* webhooks normally use payload; MEETING_STARTED/ENDED are flat.
  return (envelope.payload && typeof envelope.payload === "object"
    ? envelope.payload
    : envelope) as BookingPayload;
}

function attendeeEmail(payload: BookingPayload) {
  const attendee = Array.isArray(payload.attendees) ? payload.attendees[0] : undefined;
  return cleanEmail(attendee?.email);
}

function meetingUrl(payload: BookingPayload) {
  const metadata = payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {};
  const candidates = [
    metadata.videoCallUrl,
    metadata.meetingUrl,
    metadata.videoCallURL,
    payload.location,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && /^https?:\/\//i.test(candidate)) return candidate;
  }
  return null;
}

function eventKey(trigger: string, uid: string | null, createdAt: string | null) {
  return `${trigger}:${uid ?? "no-uid"}:${createdAt ?? "no-created-at"}`;
}

function activityAppend(
  current: Array<{ at: string; type: string; label: string }> | null | undefined,
  type: string,
  label: string
) {
  return [...(Array.isArray(current) ? current : []), { at: new Date().toISOString(), type, label }].slice(-100);
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-cal-signature-256");

  try {
    if (!verifySignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }
  } catch (error) {
    console.error("Cal.com webhook configuration error", error);
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  let envelope: WebhookEnvelope;
  try {
    envelope = JSON.parse(raw) as WebhookEnvelope;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const trigger = typeof envelope.triggerEvent === "string" ? envelope.triggerEvent : "UNKNOWN";
  const payload = bookingData(envelope);
  const uid = typeof payload.uid === "string" ? payload.uid : null;
  const createdAt = typeof envelope.createdAt === "string" ? envelope.createdAt : null;
  const key = eventKey(trigger, uid, createdAt);

  try {
    if (await calWebhookEventExists(key)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  } catch (error) {
    console.error("Cal.com webhook dedupe lookup failed", error);
  }

  const email = attendeeEmail(payload);
  const syncedAt = new Date().toISOString();
  const title = typeof payload.title === "string" ? payload.title : "Cal.com meeting";
  const eventType = typeof payload.type === "string" ? payload.type : null;
  const startTime = typeof payload.startTime === "string" ? payload.startTime : null;
  const endTime = typeof payload.endTime === "string" ? payload.endTime : null;
  const rescheduleUid = typeof payload.rescheduleUid === "string" ? payload.rescheduleUid : null;
  const cancellationReason = typeof payload.cancellationReason === "string" ? payload.cancellationReason : null;

  let leadId: string | null = null;
  let clientId: string | null = null;

  try {
    const lead = email ? await findLeadByEmail(email) : null;
    leadId = lead?.id ?? null;

    if (lead && ["BOOKING_CREATED", "BOOKING_RESCHEDULED"].includes(trigger)) {
      await updateLeadBookingSync(lead.id, {
        meeting_status: "booked",
        meeting_at: startTime,
        status: lead.status === "customer" ? lead.status : "demo_booked",
        cal_booking_uid: uid,
        cal_event_type: eventType,
        cal_synced_at: syncedAt,
        last_activity: syncedAt,
        activity: activityAppend(
          lead.activity,
          trigger === "BOOKING_CREATED" ? "meeting_booked" : "meeting_rescheduled",
          trigger === "BOOKING_CREATED"
            ? `Cal.com meeting booked for ${startTime ?? "scheduled time"}`
            : `Cal.com meeting rescheduled to ${startTime ?? "new time"}`
        ),
      });
    } else if (lead && trigger === "BOOKING_CANCELLED") {
      await updateLeadBookingSync(lead.id, {
        meeting_status: "cancelled",
        cal_booking_uid: uid,
        cal_event_type: eventType,
        cal_synced_at: syncedAt,
        last_activity: syncedAt,
        activity: activityAppend(lead.activity, "meeting_cancelled", "Cal.com meeting cancelled"),
      });
    } else if (lead && trigger === "MEETING_ENDED") {
      await updateLeadBookingSync(lead.id, {
        meeting_status: "completed",
        cal_booking_uid: uid,
        cal_event_type: eventType,
        cal_synced_at: syncedAt,
        last_activity: syncedAt,
        activity: activityAppend(lead.activity, "meeting_completed", "Cal.com meeting completed"),
      });
    } else if (lead && trigger === "BOOKING_NO_SHOW_UPDATED") {
      await updateLeadBookingSync(lead.id, {
        meeting_status: "no_show",
        cal_booking_uid: uid,
        cal_event_type: eventType,
        cal_synced_at: syncedAt,
        last_activity: syncedAt,
        activity: activityAppend(lead.activity, "meeting_no_show", "Cal.com meeting marked as no-show"),
      });
    }

    const client = email ? await findClientByEmail(email) : null;
    clientId = client?.id ?? null;

    if (client && uid && ["BOOKING_CREATED", "BOOKING_RESCHEDULED"].includes(trigger) && startTime) {
      await upsertCalClientMeeting({
        client_id: client.id,
        title,
        starts_at: startTime,
        ends_at: endTime,
        status: "scheduled",
        meeting_url: meetingUrl(payload),
        notes: null,
        cal_booking_uid: uid,
        cal_event_type: eventType,
        attendee_email: email || null,
        rescheduled_from_uid: rescheduleUid,
        cancellation_reason: null,
        cal_metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
        cal_synced_at: syncedAt,
      });
      await insertClientActivityEvent({
        client_id: client.id,
        type: trigger === "BOOKING_CREATED" ? "meeting_booked" : "meeting_rescheduled",
        label: trigger === "BOOKING_CREATED" ? `Meeting booked: ${title}` : `Meeting rescheduled: ${title}`,
        metadata: { cal_booking_uid: uid, starts_at: startTime },
      });
    } else if (client && uid && trigger === "BOOKING_CANCELLED") {
      await markCalClientMeeting(uid, {
        status: "cancelled",
        cancellation_reason: cancellationReason,
        cal_synced_at: syncedAt,
      });
      await insertClientActivityEvent({
        client_id: client.id,
        type: "meeting_cancelled",
        label: `Meeting cancelled: ${title}`,
        metadata: { cal_booking_uid: uid, reason: cancellationReason },
      });
    } else if (client && uid && trigger === "MEETING_ENDED") {
      await markCalClientMeeting(uid, { status: "completed", cal_synced_at: syncedAt });
      await insertClientActivityEvent({
        client_id: client.id,
        type: "meeting_completed",
        label: `Meeting completed: ${title}`,
        metadata: { cal_booking_uid: uid },
      });
    } else if (client && uid && trigger === "BOOKING_NO_SHOW_UPDATED") {
      await markCalClientMeeting(uid, { status: "no_show", cal_synced_at: syncedAt });
      await insertClientActivityEvent({
        client_id: client.id,
        type: "meeting_no_show",
        label: `Meeting marked no-show: ${title}`,
        metadata: { cal_booking_uid: uid },
      });
    }

    const analyticsName: Record<string, string> = {
      BOOKING_CREATED: "meeting_booked",
      BOOKING_RESCHEDULED: "meeting_rescheduled",
      BOOKING_CANCELLED: "meeting_cancelled",
      MEETING_ENDED: "meeting_completed",
      BOOKING_NO_SHOW_UPDATED: "meeting_no_show",
    };
    if (analyticsName[trigger]) {
      await insertAnalyticsEvent({
        event_name: analyticsName[trigger],
        session_id: null,
        lead_id: leadId,
        language: null,
        source: "calcom_webhook",
        page: null,
        metadata: { uid, event_type: eventType, attendee_email: email || null, client_id: clientId },
      }).catch((error) => console.error("Cal.com analytics event failed", error));
    }

    await registerCalWebhookEvent({
      event_key: key,
      trigger_event: trigger,
      booking_uid: uid,
      payload: envelope as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true, trigger, matchedLead: Boolean(leadId), matchedClient: Boolean(clientId) });
  } catch (error) {
    console.error("Cal.com webhook processing failed", { trigger, uid, email, error });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
