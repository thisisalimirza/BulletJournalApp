"use client";

import { ReactNode } from "react";
import TopBar from "./TopBar";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <TopBar title={title} subtitle={subtitle} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 md:px-6 md:py-8 dotted-grid min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
