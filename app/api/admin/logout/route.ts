import { NextRequest, NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin-auth";

function cookieDomain(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();
  return hostname === "davidpilot.com" || hostname.endsWith(".davidpilot.com")
    ? ".davidpilot.com"
    : undefined;
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie.name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: cookieDomain(request),
    maxAge: 0,
  });
  return response;
}
