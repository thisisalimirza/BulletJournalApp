"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Entry point for the app (used as the PWA start_url).
// Redirects to today's daily log client-side so the date is always current.
export default function LaunchPage() {
  const router = useRouter();

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    router.replace(`/daily/${today}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="font-mono text-sm text-fg-muted animate-pulse">Loading…</div>
    </div>
  );
}
