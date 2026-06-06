"use client";

import { useNavigationStore } from "@/lib/store/navigationStore";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { theme, setTheme, toggleSidebar, setCommandPaletteOpen } = useNavigationStore();

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 py-2 border-b border-border bg-bg-page/80 backdrop-blur-sm sticky top-0 z-10"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-fg-muted hover:text-fg hover:bg-accent-soft/50 transition-colors md:hidden"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="2" y1="8" x2="14" y2="8" />
            <line x1="2" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-fg truncate">{title}</h2>
          {subtitle && <p className="text-xs text-fg-muted truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Search button — icon-only on small screens, label on larger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-md border border-border text-sm text-fg-muted hover:text-fg hover:border-fg-faint transition-colors"
          aria-label="Search"
          title="Search (⌘K)"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <span className="hidden md:inline text-sm">Search</span>
          <kbd className="text-[10px] font-mono bg-bg px-1.5 py-0.5 rounded hidden lg:inline">⌘K</kbd>
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md text-fg-muted hover:text-fg hover:bg-accent-soft/50 transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
