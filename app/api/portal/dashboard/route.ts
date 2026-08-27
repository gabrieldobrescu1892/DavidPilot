import { NextResponse } from "next/server";
import { portalRest, portalUser } from "@/lib/client-portal";

export const runtime = "nodejs";

async function rows<T>(path: string, token: string) {
  const response = await portalRest(path, token);
  return (await response.json()) as T[];
}

export async function GET() {
  const user = await portalUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const memberships = await rows<any>(`client_users?select=client_id,role,clients(*)&user_id=eq.${encodeURIComponent(user.id)}&limit=1`, user.accessToken);
    const membership = memberships[0];
    if (!membership?.client_id) return NextResponse.json({ error: "No client workspace is assigned to this account." }, { status: 403 });
    const clientId = membership.client_id;
    const [projects, milestones, meetings, documents, proposals, support, activity, onboarding] = await Promise.all([
      rows<any>(`projects?select=*&client_id=eq.${clientId}&order=created_at.desc`, user.accessToken),
      rows<any>(`project_milestones?select=*&client_id=eq.${clientId}&order=due_at.asc.nullslast`, user.accessToken),
      rows<any>(`client_meetings?select=*&client_id=eq.${clientId}&order=starts_at.asc`, user.accessToken),
      rows<any>(`client_documents?select=*&client_id=eq.${clientId}&order=created_at.desc`, user.accessToken),
      rows<any>(`proposals?select=*&client_id=eq.${clientId}&order=created_at.desc`, user.accessToken),
      rows<any>(`support_requests?select=*&client_id=eq.${clientId}&order=created_at.desc`, user.accessToken),
      rows<any>(`client_activity?select=*&client_id=eq.${clientId}&order=created_at.desc&limit=30`, user.accessToken),
      rows<any>(`onboarding_tasks?select=*&client_id=eq.${clientId}&order=sort_order.asc,created_at.asc`, user.accessToken),
    ]);
    return NextResponse.json({ user: { id: user.id, email: user.email }, client: membership.clients, role: membership.role, projects, milestones, meetings, documents, proposals, support, activity, onboarding });
  } catch (error) {
    console.error("Portal dashboard failed", error);
    return NextResponse.json({ error: "Could not load your client workspace." }, { status: 502 });
  }
}
