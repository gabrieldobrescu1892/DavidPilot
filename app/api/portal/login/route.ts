import { NextRequest, NextResponse } from "next/server";
import { portalCookie, portalCookieOptions, supabaseAuthPassword } from "@/lib/client-portal";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  try {
    const auth = await supabaseAuthPassword(email, body.password);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(portalCookie.name, auth.access_token, { ...portalCookieOptions(request.nextUrl.hostname), maxAge: Math.min(portalCookie.maxAge, auth.expires_in || portalCookie.maxAge) });
    return response;
  } catch (error) {
    console.error("Portal login failed", error);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
}
