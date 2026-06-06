import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppProvider from "@/components/layout/AppProvider";

export const metadata: Metadata = {
  title: "BuJo — Digital Bullet Journal",
  description: "A beautiful, keyboard-first digital bullet journal",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BuJo",
  },
  applicationName: "BuJo",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
