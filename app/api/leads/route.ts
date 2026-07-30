import { NextRequest, NextResponse } from "next/server";
import { insertLead } from "@/lib/supabase-rest";

export const runtime = "nodejs";

type Message = {
  sender: "ai" | "user";
  text: string;
};

type LeadData = {
  business: string | null;
  weeklyInquiries: string | null;
  mainProblem?: string | null;
  score: number | null;
  estimatedTimeSaved: string | null;
  qualified: boolean;
};

type LeadRequest = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  language?: "ro" | "en";
  lead?: LeadData;
  conversation?: Message[];
};

const requestLog = new Map<string, number[]>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  if (recent.length >= RATE_LIMIT) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: LeadRequest;

  try {
    body = (await request.json()) as LeadRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const name = clean(body.name, 80);
  const company = clean(body.company, 120);
  const email = clean(body.email, 160).toLowerCase();
  const phone = clean(body.phone, 30);
  const language = body.language === "en" ? "en" : "ro";
  const lead = body.lead ?? null;

  const conversation = Array.isArray(body.conversation)
    ? body.conversation.slice(-10).map((message) => ({
        sender: message.sender === "user" ? ("user" as const) : ("ai" as const),
        text: clean(message.text, 1000),
      }))
    : [];

  if (
    name.length < 2 ||
    company.length < 2 ||
    !isValidEmail(email) ||
    phone.length < 6
  ) {
    return NextResponse.json(
      { error: "Please check the contact details." },
      { status: 400 }
    );
  }

  try {
    await insertLead({
      name,
      company,
      email,
      phone,
      language,
      business_type: clean(lead?.business, 160) || null,
      weekly_inquiries: clean(lead?.weeklyInquiries, 80) || null,
      main_problem: clean(lead?.mainProblem, 500) || null,
      lead_score:
        typeof lead?.score === "number"
          ? Math.max(0, Math.min(100, Math.round(lead.score)))
          : null,
      estimated_time_saved: clean(lead?.estimatedTimeSaved, 100) || null,
      qualified: Boolean(lead?.qualified),
      conversation,
      status: "new",
      notes: null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead creation failed:", error);

    return NextResponse.json(
      { error: "The lead could not be saved." },
      { status: 502 }
    );
  }
}
