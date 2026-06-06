"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationStore } from "@/lib/store/navigationStore";
import { useBulletStore } from "@/lib/store/bulletStore";
import { useShallow } from "zustand/react/shallow";
import { todayISO, currentMonthISO } from "@/lib/dates";
import { useEffect, useState } from "react";
import CalendarHeatmap from "@/components/modules/CalendarHeatmap";

const NAV_ITEMS = [
  { label: "Index", href: "/overview", key: "I", icon: "≡" },
  { label: "Future Log", href: "/future-log", key: "F", icon: "⟩" },
  { label: "Monthly Log", href: `/monthly/${currentMonthISO()}`, key: "M", icon: "▪" },
  { label: "Daily Log", href: `/daily/${todayISO()}`, key: "D", icon: "◦" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useNavigationStore((s) => s.sidebarOpen);
  const setSidebarOpen = useNavigationStore((s) => s.setSidebarOpen);
  const collectionIds = useBulletStore(useShallow((s) =>
    Object.values(s.scopes)
      .filter((sc) => sc.type === "collection")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((sc) => sc.id)
  ));
  const scopes = useBulletStore((s) => s.scopes);
  const collections = collectionIds.map((id) => scopes[id]).filter(Boolean);

  // Track whether we're on a tablet-sized screen (md: 768px+)
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsTablet(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-close sidebar on navigation on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // On tablet, sidebar is always visible regardless of sidebarOpen state
  if (!sidebarOpen && !isTablet) return null;

  return (
    <>
      {/* Mobile backdrop — only shown when manually opened on small screens */}
      {!isTablet && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className="fixed inset-y-0 left-0 z-40 w-56 border-r border-border bg-sidebar-bg flex flex-col h-full md:relative md:z-auto md:flex"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="p-4 pb-2">
          <h1 className="font-mono text-sm font-semibold tracking-widest uppercase text-fg-muted">
            BuJo
          </h1>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-accent-soft text-fg font-medium"
                    : "text-fg-muted hover:text-fg hover:bg-accent-soft/50"
                }`}
              >
                <span className="font-mono text-xs w-4 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <kbd className="text-[10px] font-mono text-fg-faint bg-bg px-1.5 py-0.5 rounded hidden sm:inline">
                  g {item.key.toLowerCase()}
                </kbd>
              </Link>
            );
          })}
        </nav>

        {collections.length > 0 && (
          <div className="px-2 py-2 border-t border-border">
            <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-fg-faint">
              Collections
            </p>
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id.replace("collection-", "")}`}
                className="flex items-center gap-2 px-3 py-3 rounded-md text-sm text-fg-muted hover:text-fg hover:bg-accent-soft/50 transition-colors"
              >
                <span className="text-xs">{col.label.charAt(0)}</span>
                <span>{col.label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="px-3 py-2 border-t border-border overflow-x-auto">
          <CalendarHeatmap />
        </div>

        <div
          className="p-3 border-t border-border"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
        >
          <p className="text-[10px] font-mono text-fg-faint text-center hidden md:block">
            ⌘K search · ? shortcuts
          </p>
          <p className="text-[10px] font-mono text-fg-faint text-center md:hidden">
            tap to navigate
          </p>
        </div>
      </aside>
    </>
  );
}
