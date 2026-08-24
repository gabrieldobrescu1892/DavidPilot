import { NextRequest, NextResponse } from "next/server";
import { adminSupabase, portalRest, portalUser } from "@/lib/client-portal";

export const runtime = "nodejs";
type Params = { params: Promise<{ id: string }> };

async function json(response: Response) { return await response.json().catch(() => []); }
async function membershipClientId(userId: string, token: string) {
  const response = await portalRest(`client_users?select=client_id&user_id=eq.${encodeURIComponent(userId)}&limit=1`, token);
  const rows = await json(response) as Array<{ client_id?: string }>;
  return rows[0]?.client_id || null;
}
async function adminRows(path: string) { return await json(await adminSupabase(path)); }
async function adminPatch(table: string, id: string, patch: Record<string, unknown>) {
  const response = await adminSupabase(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch),
  });
  const rows = await json(response); return Array.isArray(rows) ? rows[0] : rows;
}
async function addActivity(clientId: string, type: string, label: string, metadata: Record<string, unknown> = {}) {
  await adminSupabase("client_activity", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ client_id: clientId, type, label, metadata }) });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await portalUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");
  const note = String(body.note || "").trim().slice(0, 4000);
  const clientId = await membershipClientId(user.id, user.accessToken);
  if (!clientId) return NextResponse.json({ error: "No client workspace assigned." }, { status: 403 });

  const proposals = await adminRows(`proposals?id=eq.${encodeURIComponent(id)}&client_id=eq.${encodeURIComponent(clientId)}&select=*`);
  const proposal = Array.isArray(proposals) ? proposals[0] : null;
  if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });

  const now = new Date().toISOString();
  let patch: Record<string, unknown> = { updated_at: now, response_by: user.id };
  let activityType = "proposal_updated";
  let activityLabel = `Proposal updated: ${proposal.title}`;

  if (action === "view") {
    if (["shared", "sent"].includes(proposal.status)) patch = { ...patch, status: "viewed", viewed_at: proposal.viewed_at || now };
    else patch = { ...patch, viewed_at: proposal.viewed_at || now };
    activityType = "proposal_viewed"; activityLabel = `Proposal viewed: ${proposal.title}`;
  } else if (action === "accept") {
    patch = { ...patch, status: "accepted", accepted_at: now, client_response: note || null };
    activityType = "proposal_accepted"; activityLabel = `Proposal accepted: ${proposal.title}`;
  } else if (action === "request_changes") {
    if (!note) return NextResponse.json({ error: "Please describe the requested changes." }, { status: 400 });
    patch = { ...patch, status: "changes_requested", changes_requested_at: now, client_response: note };
    activityType = "proposal_changes_requested"; activityLabel = `Changes requested: ${proposal.title}`;
  } else if (action === "decline") {
    patch = { ...patch, status: "declined", declined_at: now, client_response: note || null };
    activityType = "proposal_declined"; activityLabel = `Proposal declined: ${proposal.title}`;
  } else {
    return NextResponse.json({ error: "Unknown proposal action." }, { status: 400 });
  }

  try {
    const updated = await adminPatch("proposals", id, patch);
    await addActivity(clientId, activityType, activityLabel, { proposal_id: id, note: note || null, user_id: user.id });
    if (proposal.lead_id && action === "accept") {
      await adminSupabase(`leads?id=eq.${encodeURIComponent(proposal.lead_id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "won", last_activity: now }) }).catch(() => null);
    }
    if (proposal.lead_id && action === "request_changes") {
      await adminSupabase(`leads?id=eq.${encodeURIComponent(proposal.lead_id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "proposal_sent", last_activity: now }) }).catch(() => null);
    }
    return NextResponse.json({ ok: true, proposal: updated });
  } catch (error) {
    console.error("Portal proposal action failed", { id, action, error });
    return NextResponse.json({ error: "Could not update proposal." }, { status: 502 });
  }
}
