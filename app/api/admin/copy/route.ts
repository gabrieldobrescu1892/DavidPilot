import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { insertCopyDraft, listCopyDrafts } from "@/lib/supabase-rest";

export const runtime = "nodejs";

type GenerateBody = {
  contentType?: string;
  language?: "en" | "ro";
  tone?: string;
  audience?: string;
  goal?: string;
  topic?: string;
  callToAction?: string;
  length?: string;
  leadContext?: string;
  save?: boolean;
  title?: string;
  leadId?: string | null;
};

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (typeof response.output_text === "string") return response.output_text;
  return response.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("") ?? "";
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    return NextResponse.json({ drafts: await listCopyDrafts() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load drafts." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  const body = (await request.json()) as GenerateBody;
  const language = body.language === "ro" ? "ro" : "en";
  const contentType = (body.contentType || "LinkedIn post").slice(0, 80);
  const topic = (body.topic || "").trim().slice(0, 1200);
  if (!topic) return NextResponse.json({ error: "Topic is required." }, { status: 400 });

  const instruction = language === "ro"
    ? `Scrie în limba română naturală, profesionistă și clară. Evită clișeele, exagerările, promisiunile neverificabile și jargonul inutil.`
    : `Write in natural, professional English. Avoid clichés, inflated claims, unverifiable promises, and unnecessary jargon.`;

  const input = `You are DavidPilot's senior B2B copywriter. DavidPilot is an enterprise AI engineering company. ${instruction}\n\nCreate: ${contentType}\nTopic: ${topic}\nAudience: ${body.audience || "business decision makers"}\nGoal: ${body.goal || "generate qualified interest"}\nTone: ${body.tone || "professional, confident, technically credible"}\nLength: ${body.length || "medium"}\nCall to action: ${body.callToAction || "Book an AI strategy session"}\nLead context: ${body.leadContext || "none"}\n\nReturn polished copy ready to use. Include a headline when appropriate. For social content, include a concise CTA and no more than 5 relevant hashtags. Do not add commentary about your process.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_COPY_MODEL || process.env.OPENAI_CHAT_MODEL || "gpt-5-mini",
        input,
        max_output_tokens: contentType.toLowerCase().includes("landing") ? 1800 : 900,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Copy generation failed:", response.status, detail);
      return NextResponse.json({ error: "Copy generation failed." }, { status: 502 });
    }

    const output = extractOutputText(await response.json()).trim();
    if (!output) return NextResponse.json({ error: "The model returned an empty result." }, { status: 502 });

    let draft = null;
    if (body.save) {
      draft = await insertCopyDraft({
        title: (body.title || `${contentType}: ${topic}`).slice(0, 160),
        content_type: contentType,
        language,
        tone: body.tone || null,
        audience: body.audience || null,
        goal: body.goal || null,
        topic,
        call_to_action: body.callToAction || null,
        output,
        lead_id: body.leadId || null,
        status: "draft",
      });
    }

    return NextResponse.json({ output, draft });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not generate copy." }, { status: 502 });
  }
}
