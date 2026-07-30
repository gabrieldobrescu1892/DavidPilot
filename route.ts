import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many lead submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: LeadRequest;

  try {
    body = (await request.json()) as LeadRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const company = clean(body.company, 120);
  const email = clean(body.email, 160).toLowerCase();
  const phone = clean(body.phone, 30);
  const language = body.language === "en" ? "en" : "ro";
  const lead = body.lead ?? null;
  const conversation = Array.isArray(body.conversation)
    ? body.conversation.slice(-10)
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

  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationEmail =
    process.env.LEAD_NOTIFICATION_EMAIL || "gabriel@davidpilot.com";
  const senderEmail =
    process.env.LEAD_SENDER_EMAIL || "DavidPilot <onboarding@resend.dev>";

  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return NextResponse.json(
      { error: "Lead notifications are not configured yet." },
      { status: 503 }
    );
  }

  const conversationText = conversation
    .map((message) => `${message.sender === "user" ? "Visitor" : "DavidPilot"}: ${message.text}`)
    .join("\n");

  const subject = `New DavidPilot lead: ${company}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#10213d">
      <h1 style="font-size:24px">New DavidPilot lead</h1>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Name</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Company</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(company)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Language</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${language.toUpperCase()}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Business detected</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(lead?.business || "Unknown")}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Weekly inquiries</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(lead?.weeklyInquiries || "Unknown")}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Lead score</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${lead?.score ?? "Unknown"}</td></tr>
        <tr><td style="padding:8px"><strong>Estimated time saved</strong></td><td style="padding:8px">${escapeHtml(lead?.estimatedTimeSaved || "Unknown")}</td></tr>
      </table>
      <h2 style="font-size:18px;margin-top:28px">Conversation</h2>
      <pre style="white-space:pre-wrap;background:#f5f7fa;padding:16px;border-radius:12px;font-family:Arial,sans-serif">${escapeHtml(conversationText || "No conversation captured.")}</pre>
    </div>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: senderEmail,
      to: [notificationEmail],
      reply_to: email,
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    console.error("Resend error:", details);

    return NextResponse.json(
      { error: "The lead notification could not be sent." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
