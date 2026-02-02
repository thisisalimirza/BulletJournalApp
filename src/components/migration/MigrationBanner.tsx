"use client";

import { useState, useMemo } from "react";
import { useBulletStore } from "@/lib/store/bulletStore";
import { BulletType } from "@/lib/types";
import { prevMonth, monthlyScopeId, formatMonthLabel } from "@/lib/dates";
import MigrationModal from "./MigrationModal";

interface MigrationBannerProps {
  currentMonth: string;
}

export default function MigrationBanner({ currentMonth }: MigrationBannerProps) {
  const prev = prevMonth(currentMonth);
  const prevScopeId = monthlyScopeId(prev);
  const allBullets = useBulletStore((s) => s.bullets);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const incompleteCount = useMemo(
    () => Object.values(allBullets).filter(
      (b) => b.parentId === prevScopeId && b.type === BulletType.Task
    ).length,
    [allBullets, prevScopeId]
  );

  if (incompleteCount === 0 || dismissed) return null;

  return (
    <>
      <div className="flex items-center gap-3 p-3 mb-4 rounded-lg border border-accent/30 bg-accent-soft/30">
        <span className="text-sm font-mono text-fg">
          {incompleteCount} incomplete task{incompleteCount !== 1 ? "s" : ""} from {formatMonthLabel(prev)}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1 text-xs font-mono bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          Review
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-fg-faint hover:text-fg font-mono"
        >
          dismiss
        </button>
      </div>
      {showModal && (
        <MigrationModal sourceParentId={prevScopeId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
