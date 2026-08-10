import { NextRequest, NextResponse } from "next/server";
import { portalCookie, portalCookieOptions } from "@/lib/client-portal";
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(portalCookie.name, "", { ...portalCookieOptions(request.nextUrl.hostname), maxAge: 0 });
  return response;
}
