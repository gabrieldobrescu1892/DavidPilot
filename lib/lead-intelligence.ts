export type LeadIntelligence = {
  leadScore: number | null;
  industry: string | null;
  companySize: string | null;
  urgency: "low" | "medium" | "high" | null;
  buyingIntent: "low" | "medium" | "high" | null;
  aiMaturity: "early" | "developing" | "advanced" | null;
  estimatedValueMin: number | null;
  estimatedValueMax: number | null;
  recommendedService: string | null;
  aiSummary: string | null;
  nextAction: string | null;
};

const empty: LeadIntelligence = {
  leadScore: null,
  industry: null,
  companySize: null,
  urgency: null,
  buyingIntent: null,
  aiMaturity: null,
  estimatedValueMin: null,
  estimatedValueMax: null,
  recommendedService: null,
  aiSummary: null,
  nextAction: null,
};

function text(value: unknown, max = 500): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim().replace(/\s+/g, " ").slice(0, max)
    : null;
}

function number(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.min(max, Math.round(value)))
    : null;
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : null;
}

function outputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (typeof response.output_text === "string") return response.output_text;
  return response.output
    ?.flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("") ?? "";
}

export async function analyzeLead(input: {
  company: string;
  language: "ro" | "en";
  businessType: string | null;
  weeklyInquiries: string | null;
  mainProblem: string | null;
  conversation: Array<{ sender: "ai" | "user"; text: string }>;
}): Promise<LeadIntelligence> {
  if (!process.env.OPENAI_API_KEY) return empty;

  const transcript = input.conversation
    .slice(-12)
    .map((message) => `${message.sender === "user" ? "Visitor" : "DavidPilot"}: ${message.text}`)
    .join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || "gpt-5-mini",
        instructions: `Analyze a business lead for DavidPilot, an enterprise AI engineering company. Be conservative and evidence-based. Do not invent facts. Return concise CRM intelligence. Monetary estimates are indicative EUR project ranges, not promises. Write summary and next action in ${input.language === "ro" ? "Romanian" : "English"}.`,
        input: `Company: ${input.company}\nBusiness type: ${input.businessType || "Unknown"}\nWeekly inquiries: ${input.weeklyInquiries || "Unknown"}\nMain problem: ${input.mainProblem || "Unknown"}\nConversation:\n${transcript}`,
        text: {
          format: {
            type: "json_schema",
            name: "lead_intelligence",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                leadScore: { type: ["number", "null"], minimum: 0, maximum: 100 },
                industry: { type: ["string", "null"] },
                companySize: { type: ["string", "null"] },
                urgency: { type: ["string", "null"], enum: ["low", "medium", "high", null] },
                buyingIntent: { type: ["string", "null"], enum: ["low", "medium", "high", null] },
                aiMaturity: { type: ["string", "null"], enum: ["early", "developing", "advanced", null] },
                estimatedValueMin: { type: ["number", "null"], minimum: 0, maximum: 1000000 },
                estimatedValueMax: { type: ["number", "null"], minimum: 0, maximum: 1000000 },
                recommendedService: { type: ["string", "null"] },
                aiSummary: { type: ["string", "null"] },
                nextAction: { type: ["string", "null"] },
              },
              required: ["leadScore", "industry", "companySize", "urgency", "buyingIntent", "aiMaturity", "estimatedValueMin", "estimatedValueMax", "recommendedService", "aiSummary", "nextAction"],
            },
          },
        },
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const parsed = JSON.parse(outputText(await response.json())) as Record<string, unknown>;
    return {
      leadScore: number(parsed.leadScore, 0, 100),
      industry: text(parsed.industry, 100),
      companySize: text(parsed.companySize, 80),
      urgency: enumValue(parsed.urgency, ["low", "medium", "high"] as const),
      buyingIntent: enumValue(parsed.buyingIntent, ["low", "medium", "high"] as const),
      aiMaturity: enumValue(parsed.aiMaturity, ["early", "developing", "advanced"] as const),
      estimatedValueMin: number(parsed.estimatedValueMin, 0, 1000000),
      estimatedValueMax: number(parsed.estimatedValueMax, 0, 1000000),
      recommendedService: text(parsed.recommendedService, 160),
      aiSummary: text(parsed.aiSummary, 1200),
      nextAction: text(parsed.nextAction, 500),
    };
  } catch (error) {
    console.error("Lead intelligence analysis failed:", error);
    return empty;
  }
}
