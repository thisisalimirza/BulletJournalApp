"use client";

import { useState, useEffect, useCallback } from "react";
import PageShell from "@/components/layout/PageShell";
import MonthlyCalendar from "@/components/modules/MonthlyCalendar";
import MonthlyTaskList from "@/components/modules/MonthlyTaskList";
import MigrationBanner from "@/components/migration/MigrationBanner";
import { formatMonthLabel } from "@/lib/dates";

type FocusPanel = "calendar" | "tasks";

export default function MonthlyPageClient({ month }: { month: string }) {
  const [focusPanel, setFocusPanel] = useState<FocusPanel>("tasks");

  const handleTabSwitch = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "`" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setFocusPanel((p) => (p === "calendar" ? "tasks" : "calendar"));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleTabSwitch);
    return () => window.removeEventListener("keydown", handleTabSwitch);
  }, [handleTabSwitch]);

  return (
    <PageShell title="Monthly Log" subtitle={`${formatMonthLabel(month)} — calendar overview + monthly tasks`}>
      <MigrationBanner currentMonth={month} />
      <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-fg-faint">
        <button
          onClick={() => setFocusPanel("calendar")}
          className={focusPanel === "calendar" ? "text-accent font-semibold" : ""}
        >
          Calendar
        </button>
        <kbd className="bg-accent-soft px-1.5 py-0.5 rounded hidden md:inline">`</kbd>
        <button
          onClick={() => setFocusPanel("tasks")}
          className={focusPanel === "tasks" ? "text-accent font-semibold" : ""}
        >
          Tasks
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <MonthlyCalendar month={month} active={focusPanel === "calendar"} />
        <MonthlyTaskList month={month} active={focusPanel === "tasks"} />
      </div>
    </PageShell>
  );
}
