import { NextRequest, NextResponse } from "next/server";
import { adminCookie, createAdminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

function cookieDomain(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();
  return hostname === "davidpilot.com" || hostname.endsWith(".davidpilot.com")
    ? ".davidpilot.com"
    : undefined;
}

export async function POST(request: NextRequest) {
  const { password } = (await request.json()) as { password?: string };
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie.name, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: cookieDomain(request),
    maxAge: adminCookie.maxAge,
  });
  return response;
}
