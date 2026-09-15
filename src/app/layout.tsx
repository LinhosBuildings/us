import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "US — a private universe, just for two",
  description: "A private universe. For two people. What you remember, how you remember it, what you never said out loud.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "US" },
};

export const viewport = {
  themeColor: "#07070a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="grain">
      <body className="min-h-dvh bg-midnight font-sans text-ink antialiased">{children}</body>
    </html>
  );
}