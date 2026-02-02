"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useBulletStore } from "@/lib/store/bulletStore";
import { dailyScopeId, formatDailyDate, prevDay, nextDay } from "@/lib/dates";
import BulletList from "@/components/bullet/BulletList";
import DailyReflection from "@/components/modules/DailyReflection";

interface DailyLogViewProps {
  date: string;
}

export default function DailyLogView({ date }: DailyLogViewProps) {
  const ensureScope = useBulletStore((s) => s.ensureScope);
  const scopeId = dailyScopeId(date);

  useEffect(() => {
    ensureScope({
      id: scopeId,
      type: "daily",
      label: formatDailyDate(date),
      date,
    });
  }, [date, scopeId, ensureScope]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/daily/${prevDay(date)}`}
            className="text-fg-faint hover:text-fg transition-colors text-sm font-mono px-1"
            title="Previous day (← or [)"
          >
            ‹
          </Link>
          <h3 className="font-mono text-lg font-semibold text-fg">
            {formatDailyDate(date)}
          </h3>
          <Link
            href={`/daily/${nextDay(date)}`}
            className="text-fg-faint hover:text-fg transition-colors text-sm font-mono px-1"
            title="Next day (→ or ])"
          >
            ›
          </Link>
        </div>
      </div>
      <BulletList parentId={scopeId} showInput />
      <DailyReflection parentId={scopeId} date={date} />
    </div>
  );
}
