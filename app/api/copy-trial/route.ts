import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  contentType?: string;
  language?: "en" | "ro";
  audience?: string;
  topic?: string;
};

const requests = new Map<string, number[]>();
const LIMIT = 3;
const WINDOW = 60 * 60 * 1000;

function ip(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function limited(client: string) {
  const now = Date.now();
  const recent = (requests.get(client) || []).filter((time) => now - time < WINDOW);
  if (recent.length >= LIMIT) return true;
  recent.push(now);
  requests.set(client, recent);
  return false;
}

function text(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof response.output_text === "string") return response.output_text;
  return response.output?.flatMap((item) => item.content || []).filter((item) => item.type === "output_text").map((item) => item.text || "").join("") || "";
}

export async function POST(request: NextRequest) {
  if (limited(ip(request))) return NextResponse.json({ error: "Trial limit reached." }, { status: 429 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OpenAI is not configured." }, { status: 500 });

  let body: Body;
  try { body = await request.json() as Body; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const contentType = (body.contentType || "LinkedIn post").trim().slice(0, 80);
  const audience = (body.audience || "business decision makers").trim().slice(0, 300);
  const topic = (body.topic || "").trim().slice(0, 1400);
  const language = body.language === "ro" ? "ro" : "en";
  if (topic.length < 12) return NextResponse.json({ error: "Brief is too short." }, { status: 400 });

  const languageInstruction = language === "ro"
    ? "Scrie în limba română naturală, profesionistă și convingătoare."
    : "Write in natural, professional and persuasive English.";

  const input = `You are DavidPilot's senior B2B copywriter. ${languageInstruction}\nCreate a polished ${contentType}.\nAudience: ${audience}\nBrief: ${topic}\nTone: professional, credible, commercially persuasive, without hype.\nReturn only ready-to-use copy. Include a clear headline when appropriate and a concise call to action. Do not explain your process.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_COPY_MODEL || process.env.OPENAI_CHAT_MODEL || "gpt-5-mini", input, max_output_tokens: 850 }),
    });
    if (!response.ok) {
      console.error("Public copy generation failed", response.status, await response.text());
      return NextResponse.json({ error: "Generation failed." }, { status: 502 });
    }
    const output = text(await response.json()).trim();
    if (!output) return NextResponse.json({ error: "Empty output." }, { status: 502 });
    return NextResponse.json({ output });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Generation failed." }, { status: 502 });
  }
}
