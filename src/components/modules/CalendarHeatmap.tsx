"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useBulletStore } from "@/lib/store/bulletStore";
import { todayISO } from "@/lib/dates";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getWeeks(numWeeks: number): { iso: string; month: number }[][] {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - numWeeks * 7);
  start.setDate(start.getDate() - start.getDay());

  const weeks: { iso: string; month: number }[][] = [];
  const cur = new Date(start);

  while (cur <= end) {
    const week: { iso: string; month: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const y = cur.getFullYear();
      const m = cur.getMonth() + 1;
      const day = cur.getDate();
      week.push({
        iso: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        month: m - 1,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function intensityClass(count: number): string {
  if (count === 0) return "bg-border/40";
  if (count <= 2) return "bg-accent/25";
  if (count <= 5) return "bg-accent/50";
  if (count <= 10) return "bg-accent/75";
  return "bg-accent";
}

export default function CalendarHeatmap() {
  const allBullets = useBulletStore((s) => s.bullets);

  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(allBullets).forEach((b) => {
      const day = b.createdAt.slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    });
    return counts;
  }, [allBullets]);

  // 16 weeks fits nicely in sidebar width
  const weeks = useMemo(() => getWeeks(16), []);
  const today = todayISO();

  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = week[0].month;
    if (m !== lastMonth) {
      monthLabels.push({ col: wi, label: MONTH_NAMES[m] });
      lastMonth = m;
    }
  });

  return (
    <div className="space-y-1">
      <div className="flex items-end gap-[3px]">
        <div>
          {/* Month labels */}
          <div className="flex gap-[3px] mb-[2px]">
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.col === wi);
              return (
                <div key={wi} className="w-[9px] text-[8px] text-fg-faint font-mono leading-[9px]">
                  {ml ? ml.label : ""}
                </div>
              );
            })}
          </div>
          {/* Day rows */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
            <div key={dayIndex} className="flex gap-[3px]">
              {weeks.map((week, wi) => {
                const cell = week[dayIndex];
                if (!cell || cell.iso > today) {
                  return <div key={wi} className="w-[9px] h-[9px]" />;
                }
                const count = dayCounts[cell.iso] || 0;
                return (
                  <Link
                    key={wi}
                    href={`/daily/${cell.iso}`}
                    className={`w-[9px] h-[9px] rounded-[2px] ${intensityClass(count)} ${
                      cell.iso === today ? "ring-1 ring-accent" : ""
                    } hover:ring-1 hover:ring-fg-faint transition-all`}
                    title={`${cell.iso}: ${count} entries`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 text-[8px] font-mono text-fg-faint">
        <span>Less</span>
        <div className="w-[7px] h-[7px] rounded-[1px] bg-border/40" />
        <div className="w-[7px] h-[7px] rounded-[1px] bg-accent/25" />
        <div className="w-[7px] h-[7px] rounded-[1px] bg-accent/50" />
        <div className="w-[7px] h-[7px] rounded-[1px] bg-accent/75" />
        <div className="w-[7px] h-[7px] rounded-[1px] bg-accent" />
        <span>More</span>
      </div>
    </div>
  );
}
