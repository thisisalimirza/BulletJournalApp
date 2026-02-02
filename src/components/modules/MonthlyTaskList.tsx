"use client";

import { useEffect } from "react";
import { useBulletStore } from "@/lib/store/bulletStore";
import { monthlyScopeId, formatMonthLabel } from "@/lib/dates";
import BulletList from "@/components/bullet/BulletList";

interface MonthlyTaskListProps {
  month: string;
  active?: boolean;
}

export default function MonthlyTaskList({ month, active = true }: MonthlyTaskListProps) {
  const ensureScope = useBulletStore((s) => s.ensureScope);
  const scopeId = monthlyScopeId(month);

  useEffect(() => {
    ensureScope({
      id: scopeId,
      type: "monthly",
      label: formatMonthLabel(month),
      date: month,
    });
  }, [month, scopeId, ensureScope]);

  return (
    <div>
      <h4 className="font-mono text-sm font-semibold text-fg-muted mb-2 uppercase tracking-wider">
        {formatMonthLabel(month)}
      </h4>
      <BulletList parentId={scopeId} showInput active={active} />
    </div>
  );
}
