import { cookies } from "next/headers";

const ACCESS_COOKIE = "davidpilot_portal_access";
const MAX_AGE = 60 * 60;

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const publishable = process.env.SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !secret) throw new Error("Supabase server configuration is missing.");
  return { url, secret, publishable };
}

export const portalCookie = { name: ACCESS_COOKIE, maxAge: MAX_AGE };

export async function portalAccessToken() {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value || null;
}

export async function supabaseAuthPassword(email: string, password: string) {
  const { url, publishable } = supabaseConfig();
  if (!publishable) throw new Error("SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) is required for Client Portal authentication.");
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    cache: "no-store",
    headers: { apikey: publishable, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(data.error_description || data.msg || "Invalid email or password.");
  return data as { access_token: string; expires_in?: number; user: { id: string; email?: string } };
}

export async function supabaseAuthUser(accessToken: string) {
  const { url, publishable } = supabaseConfig();
  if (!publishable) return null;
  const response = await fetch(`${url}/auth/v1/user`, {
    cache: "no-store",
    headers: { apikey: publishable, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as { id: string; email?: string; user_metadata?: Record<string, unknown> };
}

export async function portalUser() {
  const token = await portalAccessToken();
  if (!token) return null;
  const user = await supabaseAuthUser(token);
  return user ? { ...user, accessToken: token } : null;
}

export async function portalRest(path: string, accessToken: string, init: RequestInit = {}) {
  const { url, publishable } = supabaseConfig();
  if (!publishable) throw new Error("SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) is required for Client Portal RLS requests.");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: publishable,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Portal Supabase request failed (${response.status}): ${detail}`);
  }
  return response;
}

export async function adminSupabase(path: string, init: RequestInit = {}) {
  const { url, secret } = supabaseConfig();
  const legacyJwt = secret.split(".").length === 3;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: secret, ...(legacyJwt ? { Authorization: `Bearer ${secret}` } : {}), "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Admin Supabase request failed (${response.status}): ${detail}`);
  }
  return response;
}

export async function createPortalAuthUser(email: string, password: string, name: string) {
  const { url, secret } = supabaseConfig();
  const legacyJwt = secret.split(".").length === 3;
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    cache: "no-store",
    headers: { apikey: secret, ...(legacyJwt ? { Authorization: `Bearer ${secret}` } : {}), "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name } }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) throw new Error(data.msg || data.message || "Could not create client user.");
  return data as { id: string; email: string };
}

export function portalCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const hostname = process.env.VERCEL_PROJECT_PRODUCTION_URL || "";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
    ...(hostname.includes("davidpilot.com") ? { domain: ".davidpilot.com" } : {}),
  };
}
