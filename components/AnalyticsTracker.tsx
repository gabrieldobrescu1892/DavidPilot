"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function analyticsSessionId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("davidpilot-analytics-session");
  if (!id) {
    id = `${Date.now().toString(36)}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem("davidpilot-analytics-session", id);
  }
  return id;
}

export function trackEvent(eventName: string, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const language = window.localStorage.getItem("davidpilot-language") || document.documentElement.lang || "en";
  const payload = {
    event_name: eventName,
    session_id: analyticsSessionId(),
    language: language === "ro" ? "ro" : "en",
    page: window.location.pathname + window.location.hash,
    source: document.referrer ? new URL(document.referrer).hostname : "direct",
    ...data,
  };
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackEvent("page_view", { page: pathname });
  }, [pathname]);
  return null;
}
