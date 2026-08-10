import { NextResponse } from "next/server";
import { portalCookie, portalCookieOptions } from "@/lib/client-portal";
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(portalCookie.name, "", { ...portalCookieOptions(), maxAge: 0 });
  return response;
}
