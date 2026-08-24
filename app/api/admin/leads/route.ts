import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { insertAnalyticsEvent, listLeads, updateLead, type LeadStatus } from "@/lib/supabase-rest";
import { adminSupabase } from "@/lib/client-portal";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search") || "";
  const status = request.nextUrl.searchParams.get("status") || "all";

  try {
    // Load all matching leads first so proposal lifecycle can reconcile CRM status
    // before the optional pipeline-status filter is applied.
    const leads = await listLeads({ search, status: "all" });
    const proposalResponse = await adminSupabase(
      "proposals?select=id,lead_id,title,status,shared_at,viewed_at,accepted_at,declined_at,changes_requested_at,client_response,updated_at&lead_id=not.is.null&order=updated_at.desc"
    );
    const proposals = (await proposalResponse.json().catch(() => [])) as Array<{
      id: string; lead_id: string | null; title: string; status: string; shared_at: string | null;
      viewed_at: string | null; accepted_at: string | null; declined_at: string | null;
      changes_requested_at: string | null; client_response: string | null; updated_at: string | null;
    }>;

    const latestByLead = new Map<string, (typeof proposals)[number]>();
    for (const proposal of proposals) {
      if (proposal.lead_id && !latestByLead.has(proposal.lead_id)) latestByLead.set(proposal.lead_id, proposal);
    }

    const reconciled = await Promise.all(leads.map(async (lead) => {
      const proposal = latestByLead.get(lead.id) || null;
      if (!proposal) return { ...lead, latest_proposal: null };

      let derivedStatus: LeadStatus = lead.status;
      if (proposal.status === "accepted") derivedStatus = "customer";
      else if (["shared", "viewed", "changes_requested"].includes(proposal.status) && !["customer", "closed"].includes(lead.status)) derivedStatus = "proposal_sent";

      if (derivedStatus !== lead.status) {
        const eventAt = proposal.accepted_at || proposal.changes_requested_at || proposal.viewed_at || proposal.shared_at || proposal.updated_at || new Date().toISOString();
        const label = proposal.status === "accepted"
          ? `Proposal accepted: ${proposal.title}`
          : proposal.status === "changes_requested"
            ? `Proposal changes requested: ${proposal.title}`
            : `Proposal ${proposal.status}: ${proposal.title}`;
        const exists = (lead.activity || []).some((item) => item.type === `proposal_${proposal.status}` && item.label === label);
        const activity = exists ? (lead.activity || []) : [...(lead.activity || []), { at: eventAt, type: `proposal_${proposal.status}`, label }].slice(-100);
        try {
          await updateLead(lead.id, { status: derivedStatus, activity, last_activity: eventAt });
        } catch (syncError) {
          console.error("Lead/proposal reconciliation failed", { leadId: lead.id, proposalId: proposal.id, syncError });
        }
        return { ...lead, status: derivedStatus, activity, latest_proposal: proposal };
      }

      return { ...lead, latest_proposal: proposal };
    }));

    const filtered = status === "all" ? reconciled : reconciled.filter((lead) => lead.status === status);
    return NextResponse.json({ leads: filtered });
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
