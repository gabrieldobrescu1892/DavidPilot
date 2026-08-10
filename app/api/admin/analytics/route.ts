import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAnalyticsEvents, listLeads, listProposals } from "@/lib/supabase-rest";

export const runtime = "nodejs";

function startForRange(range: string) {
  const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "365d" ? 365 : 30;
  return new Date(Date.now() - days * 86400000).toISOString();
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const range = request.nextUrl.searchParams.get("range") || "30d";
  const from = startForRange(range);

  try {
    const [events, leads, proposals] = await Promise.all([
      listAnalyticsEvents({ from, limit: 10000 }),
      listLeads({ status: "all" }),
      listProposals(),
    ]);

    const periodLeads = leads.filter((lead) => lead.created_at >= from);
    const periodProposals = proposals.filter((proposal) => proposal.created_at >= from);
    return NextResponse.json({ events, leads: periodLeads, proposals: periodProposals, from });
  } catch (error) {
    console.error("Analytics dashboard load failed", error);
    return NextResponse.json({ error: "Could not load analytics." }, { status: 502 });
  }
}
