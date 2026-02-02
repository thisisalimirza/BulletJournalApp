"use client";

import { use, useState, useEffect, useCallback } from "react";
import PageShell from "@/components/layout/PageShell";
import MonthlyCalendar from "@/components/modules/MonthlyCalendar";
import MonthlyTaskList from "@/components/modules/MonthlyTaskList";
import MigrationBanner from "@/components/migration/MigrationBanner";
import { formatMonthLabel } from "@/lib/dates";

type FocusPanel = "calendar" | "tasks";

export default function MonthlyPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = use(params);
  const [focusPanel, setFocusPanel] = useState<FocusPanel>("tasks");

  const handleTabSwitch = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Use ` (backtick) to toggle panels — Tab is used for indent in BulletList
      if (e.key === "`" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setFocusPanel((p) => (p === "calendar" ? "tasks" : "calendar"));
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleTabSwitch);
    return () => window.removeEventListener("keydown", handleTabSwitch);
  }, [handleTabSwitch]);

  return (
    <PageShell title="Monthly Log" subtitle={`${formatMonthLabel(month)} — calendar overview + monthly tasks`}>
      <MigrationBanner currentMonth={month} />
      <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-fg-faint">
        <span className={focusPanel === "calendar" ? "text-accent font-semibold" : ""}>Calendar</span>
        <kbd className="bg-accent-soft px-1.5 py-0.5 rounded">`</kbd>
        <span className={focusPanel === "tasks" ? "text-accent font-semibold" : ""}>Tasks</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <MonthlyCalendar month={month} active={focusPanel === "calendar"} />
        <MonthlyTaskList month={month} active={focusPanel === "tasks"} />
      </div>
    </PageShell>
  );
}
