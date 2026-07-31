import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "davidpilot_admin";
const MAX_AGE = 60 * 60 * 12;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 24) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 24 characters.");
  }
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createAdminToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = String(expiresAt);
  return `${payload}.${signature(payload)}`;
}

export function verifyAdminToken(token?: string | null) {
  if (!token) return false;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now() / 1000) return false;

  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);

  return (
    expected.length === supplied.length &&
    timingSafeEqual(expected, supplied)
  );
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return verifyAdminToken(store.get(COOKIE_NAME)?.value);
}

export const adminCookie = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE,
};
