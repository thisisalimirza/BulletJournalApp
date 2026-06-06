"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
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
