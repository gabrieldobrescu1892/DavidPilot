import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listLeads, updateLead, type LeadStatus } from "@/lib/supabase-rest";

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
  };

  const validStatuses: LeadStatus[] = [
    "new",
    "contacted",
    "demo_booked",
    "customer",
    "closed",
  ];

  if (!body.id) {
    return NextResponse.json({ error: "Missing lead ID." }, { status: 400 });
  }

  const patch: { status?: LeadStatus; notes?: string } = {};
  if (body.status && validStatuses.includes(body.status)) {
    patch.status = body.status;
  }
  if (typeof body.notes === "string") {
    patch.notes = body.notes.slice(0, 3000);
  }

  try {
    await updateLead(body.id, patch);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update lead." }, { status: 502 });
  }
}
