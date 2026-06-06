"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBulletStore } from "@/lib/store/bulletStore";
import { useNavigationStore } from "@/lib/store/navigationStore";
import { prevDay, nextDay, prevMonth, nextMonth, todayISO, currentMonthISO } from "@/lib/dates";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import ShortcutHelp from "./ShortcutHelp";
import UndoToast from "./UndoToast";
import BottomTabBar from "./BottomTabBar";
import PWAInstallBanner from "./PWAInstallBanner";

// Routes that should render without the app shell (sidebar, tab bar, etc.)
const SHELL_EXCLUDED = ["/", "/launch"];

export default function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrate = useBulletStore((s) => s.hydrate);
  const hydrated = useBulletStore((s) => s.hydrated);
  const theme = useNavigationStore((s) => s.theme);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Global keyboard shortcuts (app only)
  useEffect(() => {
    if (SHELL_EXCLUDED.includes(pathname)) return;

    let pending = "";
    let timeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        const store = useNavigationStore.getState();
        store.setTheme(store.theme === "dark" ? "light" : "dark");
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const store = useNavigationStore.getState();
        store.setShortcutHelpOpen(!store.shortcutHelpOpen);
        return;
      }

      if (pending === "g") {
        clearTimeout(timeout);
        pending = "";
        const nav = (path: string) => { e.preventDefault(); routerRef.current.push(path); };
        switch (e.key) {
          case "d": nav(`/daily/${todayISO()}`); return;
          case "m": nav(`/monthly/${currentMonthISO()}`); return;
          case "f": nav("/future-log"); return;
          case "i": nav("/overview"); return;
          case "c": nav("/collections"); return;
        }
      }

      if (e.key === "g") {
        pending = "g";
        timeout = setTimeout(() => { pending = ""; }, 500);
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "[" || e.key === "]") {
        const path = window.location.pathname;
        const isNext = e.key === "ArrowRight" || e.key === "]";

        const dailyMatch = path.match(/^\/daily\/(\d{4}-\d{2}-\d{2})/);
        if (dailyMatch) {
          e.preventDefault();
          routerRef.current.push(`/daily/${isNext ? nextDay(dailyMatch[1]) : prevDay(dailyMatch[1])}`);
          return;
        }

        const monthlyMatch = path.match(/^\/monthly\/(\d{4}-\d{2})/);
        if (monthlyMatch) {
          e.preventDefault();
          routerRef.current.push(`/monthly/${isNext ? nextMonth(monthlyMatch[1]) : prevMonth(monthlyMatch[1])}`);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Touch swipe gestures for day/month navigation (app only)
  useEffect(() => {
    if (SHELL_EXCLUDED.includes(pathname)) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 2) return;

      const path = window.location.pathname;
      const isNext = dx < 0;

      const dailyMatch = path.match(/^\/daily\/(\d{4}-\d{2}-\d{2})/);
      if (dailyMatch) {
        routerRef.current.push(`/daily/${isNext ? nextDay(dailyMatch[1]) : prevDay(dailyMatch[1])}`);
        return;
      }
      const monthlyMatch = path.match(/^\/monthly\/(\d{4}-\d{2})/);
      if (monthlyMatch) {
        routerRef.current.push(`/monthly/${isNext ? nextMonth(monthlyMatch[1]) : prevMonth(monthlyMatch[1])}`);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Marketing page and launch page: render without app shell
  if (SHELL_EXCLUDED.includes(pathname)) {
    return <>{children}</>;
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="font-mono text-sm text-fg-muted animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
        <BottomTabBar />
      </div>
      <CommandPalette />
      <ShortcutHelp />
      <UndoToast />
      <PWAInstallBanner />
    </div>
  );
}
