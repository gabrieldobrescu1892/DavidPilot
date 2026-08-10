import { NextRequest, NextResponse } from "next/server";
import { portalRest, portalUser } from "@/lib/client-portal";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const user = await portalUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { subject?: string; message?: string; priority?: string };
  if (!body.subject?.trim() || !body.message?.trim()) return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  try {
    const memberships = await portalRest(`client_users?select=client_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`, user.accessToken).then(r => r.json()) as Array<{client_id:string}>;
    const clientId = memberships[0]?.client_id;
    if (!clientId) return NextResponse.json({ error: "No client workspace assigned." }, { status: 403 });
    await portalRest("support_requests", user.accessToken, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ client_id: clientId, created_by: user.id, subject: body.subject.trim().slice(0,160), message: body.message.trim().slice(0,5000), priority: ["low","normal","high"].includes(body.priority||"") ? body.priority : "normal", status: "open" }) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Support request failed", error);
    return NextResponse.json({ error: "Could not submit the request." }, { status: 502 });
  }
}
