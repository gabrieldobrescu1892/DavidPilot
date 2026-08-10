import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminSupabase, createPortalAuthUser } from "@/lib/client-portal";
export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const response = await adminSupabase("clients?select=*,client_users(id,user_id,email,role,created_at),projects(id,name,status,progress,created_at)&order=created_at.desc");
    return NextResponse.json({ clients: await response.json() });
  } catch (error) {
    console.error(error); return NextResponse.json({ error: "Could not load clients." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { company?: string; contact_name?: string; email?: string; password?: string };
  const company = body.company?.trim(); const name = body.contact_name?.trim(); const email = body.email?.trim().toLowerCase();
  if (!company || !name || !email || !body.password || body.password.length < 8) return NextResponse.json({ error: "Company, contact, email and a password of at least 8 characters are required." }, { status: 400 });
  try {
    const user = await createPortalAuthUser(email, body.password, name);
    const clientResponse = await adminSupabase("clients", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ name: company, primary_contact_name: name, primary_contact_email: email, status: "active" }) });
    const clients = await clientResponse.json() as Array<{id:string}>; const clientId = clients[0]?.id;
    if (!clientId) throw new Error("Client record was not created.");
    await adminSupabase("client_users", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ client_id: clientId, user_id: user.id, email, role: "client_admin" }) });
    await adminSupabase("client_activity", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ client_id: clientId, type: "client_created", label: `Client workspace created for ${company}` }) });
    return NextResponse.json({ ok: true, client_id: clientId });
  } catch (error) {
    console.error("Create client failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create client." }, { status: 502 });
  }
}
