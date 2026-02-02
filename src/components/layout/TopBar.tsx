"use client";

import { useRouter } from "next/navigation";
import { useNavigationStore } from "@/lib/store/navigationStore";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter();
  const { theme, setTheme, toggleSidebar, setCommandPaletteOpen } = useNavigationStore();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-page/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-accent-soft/50 transition-colors"
          title="Toggle sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="2" y1="8" x2="14" y2="8" />
            <line x1="2" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        <div>
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          {subtitle && <p className="text-xs text-fg-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-md text-fg-faint hover:text-fg hover:bg-accent-soft/50 transition-colors"
          title="Go back"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10,3 5,8 10,13" />
          </svg>
        </button>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm text-fg-muted hover:text-fg hover:border-fg-faint transition-colors"
        >
          <span>Search...</span>
          <kbd className="text-[10px] font-mono bg-bg px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md text-fg-muted hover:text-fg hover:bg-accent-soft/50 transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
