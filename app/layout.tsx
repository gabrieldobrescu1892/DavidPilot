import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DavidPilot — Your AI employee",
  description:
    "DavidPilot answers customers, qualifies leads and books appointments 24/7.",
  metadataBase: new URL("https://davidpilot.com"),
  openGraph: {
    title: "DavidPilot — Your AI employee",
    description:
      "Answers customers. Qualifies leads. Books appointments. 24/7.",
    url: "https://davidpilot.com",
    siteName: "DavidPilot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
