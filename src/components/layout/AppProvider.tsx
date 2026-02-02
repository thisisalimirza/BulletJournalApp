"use client";

import { useEffect, ReactNode } from "react";
import { useBulletStore } from "@/lib/store/bulletStore";
import { useNavigationStore } from "@/lib/store/navigationStore";
import { prevDay, nextDay, prevMonth, nextMonth, todayISO, currentMonthISO } from "@/lib/dates";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import ShortcutHelp from "./ShortcutHelp";
import UndoToast from "./UndoToast";

export default function AppProvider({ children }: { children: ReactNode }) {
  const hydrate = useBulletStore((s) => s.hydrate);
  const hydrated = useBulletStore((s) => s.hydrated);
  const theme = useNavigationStore((s) => s.theme);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    let pending = "";
    let timeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Cmd+D for dark mode
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        const store = useNavigationStore.getState();
        store.setTheme(store.theme === "dark" ? "light" : "dark");
        return;
      }

      // ? for shortcut help
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const store = useNavigationStore.getState();
        store.setShortcutHelpOpen(!store.shortcutHelpOpen);
        return;
      }

      // Handle 'g' sequences
      if (pending === "g") {
        clearTimeout(timeout);
        pending = "";
        const nav = (path: string) => {
          e.preventDefault();
          window.location.href = path;
        };
        switch (e.key) {
          case "d": nav(`/daily/${todayISO()}`); return;
          case "m": nav(`/monthly/${currentMonthISO()}`); return;
          case "f": nav("/future-log"); return;
          case "i": nav("/index"); return;
          case "c": nav("/collections"); return;
        }
      }

      if (e.key === "g") {
        pending = "g";
        timeout = setTimeout(() => { pending = ""; }, 500);
        return;
      }

      // ArrowLeft/Right and [/] for prev/next page navigation
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "[" || e.key === "]") {
        const path = window.location.pathname;
        const isNext = e.key === "ArrowRight" || e.key === "]";

        // Daily log: /daily/YYYY-MM-DD
        const dailyMatch = path.match(/^\/daily\/(\d{4}-\d{2}-\d{2})$/);
        if (dailyMatch) {
          e.preventDefault();
          const date = dailyMatch[1];
          window.location.href = `/daily/${isNext ? nextDay(date) : prevDay(date)}`;
          return;
        }

        // Monthly log: /monthly/YYYY-MM
        const monthlyMatch = path.match(/^\/monthly\/(\d{4}-\d{2})$/);
        if (monthlyMatch) {
          e.preventDefault();
          const month = monthlyMatch[1];
          window.location.href = `/monthly/${isNext ? nextMonth(month) : prevMonth(month)}`;
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="font-mono text-sm text-fg-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      {children}
      <CommandPalette />
      <ShortcutHelp />
      <UndoToast />
    </div>
  );
}
