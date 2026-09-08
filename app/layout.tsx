import type { Metadata } from "next";
import "./globals.css";
import "./public-pages.css";
import SiteHeader from '@/components/site-header';

export const metadata: Metadata = {
  title: "Paladin Woodworks | Fine Woodworking & Design",
  description: "Thoughtful boxes, cabinetry, and practical woodworking design tools. Explore Paladin Woodworks and the watch-box planner.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><SiteHeader/>{children}</body>
    </html>
  );
}
