"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { todayISO, currentMonthISO } from "@/lib/dates";

const TABS = [
  { label: "Index", href: "/overview", match: "/overview", icon: "≡" },
  { label: "Future", href: "/future-log", match: "/future-log", icon: "›" },
  { label: "Monthly", href: `/monthly/${currentMonthISO()}`, match: "/monthly", icon: "▪" },
  { label: "Daily", href: `/daily/${todayISO()}`, match: "/daily", icon: "◦" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-border bg-sidebar-bg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.match);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active ? "text-accent" : "text-fg-muted"
            }`}
          >
            <span className="font-mono text-base leading-none">{tab.icon}</span>
            <span className="text-[10px] font-mono tracking-wide">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
