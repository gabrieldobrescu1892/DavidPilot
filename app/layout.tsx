import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "DavidPilot — Angajatul tău AI",
  description:
    "DavidPilot răspunde clienților, califică lead-uri și programează întâlniri 24/7.",
  metadataBase: new URL("https://davidpilot.com"),
  openGraph: {
    title: "DavidPilot — Angajatul tău AI",
    description:
      "Răspunde clienților. Califică lead-uri. Programează întâlniri. 24/7.",
    url: "https://davidpilot.com",
    siteName: "DavidPilot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
