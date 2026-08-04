import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { insertProposal, listProposals, updateProposal, type ProposalContent } from "@/lib/supabase-rest";

export const runtime = "nodejs";

type GenerateBody = {
  lead?: Record<string, unknown>;
  language?: "en" | "ro";
  investmentMin?: number | null;
  investmentMax?: number | null;
  timeline?: string;
  save?: boolean;
};

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof response.output_text === "string") return response.output_text;
  return response.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("") ?? "";
}

function parseJson(text: string): ProposalContent {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<ProposalContent>;
  return {
    executive_summary: parsed.executive_summary || "",
    current_challenges: parsed.current_challenges || "",
    recommended_solution: parsed.recommended_solution || "",
    scope: Array.isArray(parsed.scope) ? parsed.scope.map(String) : [],
    delivery_approach: parsed.delivery_approach || "",
    expected_outcomes: Array.isArray(parsed.expected_outcomes) ? parsed.expected_outcomes.map(String) : [],
    assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.map(String) : [],
    next_steps: parsed.next_steps || "",
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try { return NextResponse.json({ proposals: await listProposals() }); }
  catch (error) { console.error(error); return NextResponse.json({ error: "Could not load proposals." }, { status: 502 }); }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  const body = (await request.json()) as GenerateBody;
  const lead = body.lead || {};
  const language = body.language === "ro" ? "ro" : "en";
  const prompt = `You are DavidPilot's senior enterprise AI consultant. Create a concise, credible, client-ready proposal in ${language === "ro" ? "Romanian" : "English"}. Avoid hype and guarantees. Use only the supplied lead context. Return valid JSON only with keys executive_summary, current_challenges, recommended_solution, scope (array), delivery_approach, expected_outcomes (array), assumptions (array), next_steps.\n\nLead context:\n${JSON.stringify(lead, null, 2)}\nInvestment range: EUR ${body.investmentMin ?? "TBD"} - ${body.investmentMax ?? "TBD"}\nTimeline: ${body.timeline || "TBD"}`;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_PROPOSAL_MODEL || process.env.OPENAI_CHAT_MODEL || "gpt-5-mini", input: prompt, max_output_tokens: 2200 }),
    });
    if (!response.ok) { console.error(await response.text()); return NextResponse.json({ error: "Proposal generation failed." }, { status: 502 }); }
    const content = parseJson(extractOutputText(await response.json()));
    const company = String(lead.company || "Client");
    const title = language === "ro" ? `Propunere AI pentru ${company}` : `AI Proposal for ${company}`;
    let proposal = null;
    if (body.save) {
      proposal = await insertProposal({
        lead_id: typeof lead.id === "string" ? lead.id : null,
        title,
        language,
        status: "draft",
        currency: "EUR",
        investment_min: body.investmentMin ?? null,
        investment_max: body.investmentMax ?? null,
        timeline: body.timeline || null,
        valid_until: null,
        content,
      });
    }
    return NextResponse.json({ content, proposal, title });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Could not generate proposal." }, { status: 502 }); }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json()) as { id?: string; patch?: Record<string, unknown> };
  if (!body.id || !body.patch) return NextResponse.json({ error: "Missing proposal update." }, { status: 400 });
  try { return NextResponse.json({ proposal: await updateProposal(body.id, body.patch) }); }
  catch (error) { console.error(error); return NextResponse.json({ error: "Could not update proposal." }, { status: 502 }); }
}
