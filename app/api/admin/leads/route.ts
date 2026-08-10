import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { insertAnalyticsEvent, listLeads, updateLead, type LeadStatus } from "@/lib/supabase-rest";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search") || "";
  const status = request.nextUrl.searchParams.get("status") || "all";

  try {
    const leads = await listLeads({ search, status });
    return NextResponse.json({ leads });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load leads." }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    status?: LeadStatus;
    notes?: string;
    meeting_status?: "not_booked" | "booked" | "completed" | "cancelled" | "no_show";
    meeting_at?: string | null;
    next_follow_up?: string | null;
    owner?: string;
    lost_reason?: string;
    activity?: Array<{ at: string; type: string; label: string }>;
  };

  const validStatuses: LeadStatus[] = [
    "new",
    "contacted",
    "demo_booked",
    "proposal_sent",
    "customer",
    "closed",
  ];

  if (!body.id) {
    return NextResponse.json({ error: "Missing lead ID." }, { status: 400 });
  }

  const patch: {
    status?: LeadStatus; notes?: string; meeting_status?: "not_booked" | "booked" | "completed" | "cancelled" | "no_show";
    meeting_at?: string | null; next_follow_up?: string | null; owner?: string; lost_reason?: string;
    activity?: Array<{ at: string; type: string; label: string }>; last_activity?: string;
  } = {};
  if (body.status && validStatuses.includes(body.status)) {
    patch.status = body.status;
  }
  if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 6000);
  if (body.meeting_status && ["not_booked","booked","completed","cancelled","no_show"].includes(body.meeting_status)) patch.meeting_status = body.meeting_status;
  if (body.meeting_at === null || typeof body.meeting_at === "string") patch.meeting_at = body.meeting_at || null;
  if (body.next_follow_up === null || typeof body.next_follow_up === "string") patch.next_follow_up = body.next_follow_up || null;
  if (typeof body.owner === "string") patch.owner = body.owner.slice(0, 120);
  if (typeof body.lost_reason === "string") patch.lost_reason = body.lost_reason.slice(0, 500);
  if (Array.isArray(body.activity)) patch.activity = body.activity.slice(-100);
  patch.last_activity = new Date().toISOString();

  try {
    await updateLead(body.id, patch);
    if (patch.status) {
      await insertAnalyticsEvent({ event_name: "lead_status_changed", session_id: null, lead_id: body.id, language: null, source: "admin", page: "/admin", metadata: { status: patch.status } }).catch((error) => console.error("Lead status analytics failed", error));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update lead." }, { status: 502 });
  }
}
