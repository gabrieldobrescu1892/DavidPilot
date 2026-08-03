import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leadership",
  description: "Meet Gabriel Dobrescu, Founder and CEO of DavidPilot, and discover the engineering leadership behind our enterprise AI work.",
};

export default function LeadershipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
