import { NextResponse } from "next/server";

type Message = {
  sender: "ai" | "user";
  text: string;
};

type LeadData = {
  business: string | null;
  weeklyInquiries: string | null;
  score: number | null;
  estimatedTimeSaved: string | null;
  qualified: boolean;
};

type RequestBody = {
  language?: "ro" | "en";
  messages?: Message[];
  lead?: LeadData;
};

type RateEntry = { count: number; resetAt: number };

const emptyLead: LeadData = {
  business: null,
  weeklyInquiries: null,
  score: null,
  estimatedTimeSaved: null,
  qualified: false,
};

const MAX_USER_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;

// Lightweight protection for a public demo. For production across many Vercel
// instances, replace this with a shared store such as Vercel KV or Upstash.
const globalForRateLimit = globalThis as typeof globalThis & {
  davidPilotRateLimit?: Map<string, RateEntry>;
};
const rateLimitStore =
  globalForRateLimit.davidPilotRateLimit ?? new Map<string, RateEntry>();
globalForRateLimit.davidPilotRateLimit = rateLimitStore;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_REQUESTS) return true;

  current.count += 1;
  rateLimitStore.set(ip, current);
  return false;
}

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const response = payload as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ type?: string; text?: string; refusal?: string }>;
    }>;
  };

  if (typeof response.output_text === "string") return response.output_text;

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text ?? "")
      .join("") ?? ""
  );
}

function normalizeLead(value: Partial<LeadData> | undefined): LeadData {
  return {
    business:
      typeof value?.business === "string" && value.business.trim()
        ? value.business.trim().slice(0, 80)
        : null,
    weeklyInquiries:
      typeof value?.weeklyInquiries === "string" &&
      value.weeklyInquiries.trim()
        ? value.weeklyInquiries.trim().slice(0, 40)
        : null,
    score:
      typeof value?.score === "number"
        ? Math.max(0, Math.min(100, Math.round(value.score)))
        : null,
    estimatedTimeSaved:
      typeof value?.estimatedTimeSaved === "string" &&
      value.estimatedTimeSaved.trim()
        ? value.estimatedTimeSaved.trim().slice(0, 40)
        : null,
    qualified: value?.qualified === true,
  };
}

function parseJson(text: string): { message: string; lead: LeadData } {
  const parsed = JSON.parse(text) as {
    message?: unknown;
    lead?: Partial<LeadData>;
  };

  if (typeof parsed.message !== "string" || !parsed.message.trim()) {
    throw new Error("The model returned an invalid message.");
  }

  return {
    message: parsed.message.trim().slice(0, 700),
    lead: normalizeLead(parsed.lead),
  };
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    message: { type: "string" },
    lead: {
      type: "object",
      additionalProperties: false,
      properties: {
        business: { type: ["string", "null"] },
        weeklyInquiries: { type: ["string", "null"] },
        score: { type: ["number", "null"], minimum: 0, maximum: 100 },
        estimatedTimeSaved: { type: ["string", "null"] },
        qualified: { type: "boolean" },
      },
      required: [
        "business",
        "weeklyInquiries",
        "score",
        "estimatedTimeSaved",
        "qualified",
      ],
    },
  },
  required: ["message", "lead"],
} as const;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    if (isRateLimited(clientIp(request))) {
      return NextResponse.json(
        {
          error:
            "Demo message limit reached. Please try again later or book a demo.",
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as RequestBody;
    const language = body.language === "en" ? "en" : "ro";
    const allMessages = Array.isArray(body.messages)
      ? body.messages.filter(
          (message): message is Message =>
            (message?.sender === "ai" || message?.sender === "user") &&
            typeof message.text === "string" &&
            message.text.trim().length > 0
        )
      : [];

    const userMessageCount = allMessages.filter(
      (message) => message.sender === "user"
    ).length;

    if (userMessageCount > MAX_USER_MESSAGES) {
      return NextResponse.json(
        {
          error:
            language === "ro"
              ? "Demo-ul s-a încheiat. Programează o demonstrație completă."
              : "The demo has ended. Book a full demonstration.",
        },
        { status: 429 }
      );
    }

    const latestUserMessage = [...allMessages]
      .reverse()
      .find((message) => message.sender === "user");

    if (!latestUserMessage) {
      return NextResponse.json(
        { error: "A user message is required." },
        { status: 400 }
      );
    }

    if (latestUserMessage.text.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error:
            language === "ro"
              ? `Mesajul poate avea maximum ${MAX_MESSAGE_LENGTH} de caractere.`
              : `Messages can contain at most ${MAX_MESSAGE_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    // Keep only the latest six messages to reduce repeated input-token costs.
    const messages = allMessages.slice(-6).map((message) => ({
      role: message.sender === "user" ? "user" : "assistant",
      content: message.text.slice(0, MAX_MESSAGE_LENGTH),
    }));

    const currentLead = normalizeLead(body.lead ?? emptyLead);
    const languageInstruction =
      language === "ro"
        ? "Reply only in natural Romanian."
        : "Reply only in natural English.";

    // Keep this stable and compact. Stable prompt prefixes can benefit from
    // OpenAI prompt caching when eligible.
    const instructions = `You are DavidPilot, a concise AI receptionist demo for service businesses. ${languageInstruction}

Goal: show practical value and qualify the visitor naturally.
- Ask exactly one useful question at a time.
- Keep replies to 1-3 short sentences, normally under 45 words.
- Collect only: business type, approximate weekly inquiries, and main customer-service or booking problem.
- Never ask again for information already present in the lead state or recent messages.
- Never invent pricing, integrations, results, appointments, customer data, or capabilities.
- Do not act as a general-purpose assistant. Briefly redirect unrelated questions to how DavidPilot could help the visitor's business.
- Estimate time saved conservatively only when inquiry volume is known. Assume roughly 5-10 minutes of repetitive handling per inquiry and state a rounded range.
- Score leads conservatively: 25 after business type, 50 after inquiry volume, 75 after a clear problem, and 85-95 only when the visitor shows demo intent.
- Mark qualified only when business type, volume, and a clear need are known.
- Once qualified, explain one relevant DavidPilot workflow and invite the visitor to book a tailored demo. Do not claim a booking occurred.
- If the visitor shares sensitive personal data, do not repeat it; steer back to business requirements.`;

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || "gpt-5.6-luna",
        reasoning: { effort: "none" },
        max_output_tokens: 220,
        instructions,
        input: [
          {
            role: "developer",
            content: `Lead state: ${JSON.stringify(currentLead)}`,
          },
          ...messages,
        ],
        text: {
          format: {
            type: "json_schema",
            name: "davidpilot_lead_reply",
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });

    const payload = (await openAIResponse.json()) as unknown;

    if (!openAIResponse.ok) {
      console.error("OpenAI API error", payload);
      return NextResponse.json(
        { error: "The AI service is temporarily unavailable." },
        { status: 502 }
      );
    }

    const result = parseJson(extractOutputText(payload));

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("DavidPilot chat route error", error);
    return NextResponse.json(
      { error: "Unable to process the chat request." },
      { status: 500 }
    );
  }
}
