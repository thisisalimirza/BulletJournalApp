"use client";

import { useState, useMemo } from "react";
import { useBulletStore } from "@/lib/store/bulletStore";
import { BulletType } from "@/lib/types";
import { monthlyScopeId, currentMonthISO } from "@/lib/dates";
import BulletIcon from "@/components/bullet/BulletIcon";

interface MigrationModalProps {
  sourceParentId: string;
  onClose: () => void;
}

export default function MigrationModal({ sourceParentId, onClose }: MigrationModalProps) {
  const allBullets = useBulletStore((s) => s.bullets);
  const bullets = useMemo(
    () => Object.values(allBullets).filter((b) => b.parentId === sourceParentId).sort((a, b) => a.sortOrder - b.sortOrder),
    [allBullets, sourceParentId]
  );
  const toggleComplete = useBulletStore((s) => s.toggleComplete);
  const migrateBullet = useBulletStore((s) => s.migrateBullet);
  const scheduleBullet = useBulletStore((s) => s.scheduleBullet);
  const deleteBullet = useBulletStore((s) => s.deleteBullet);
  const incompleteTasks = bullets.filter((b) => b.type === BulletType.Task);
  const [processed, setProcessed] = useState<Set<string>>(new Set());

  const targetMonthly = monthlyScopeId(currentMonthISO());

  if (incompleteTasks.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-bg-page border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3 className="font-mono text-lg font-semibold mb-2">Migration Review</h3>
          <p className="text-sm text-fg-muted">No incomplete tasks to review.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 text-sm bg-accent text-white rounded-md">
            Done
          </button>
        </div>
      </div>
    );
  }

  const handleAction = async (id: string, action: "complete" | "migrate" | "schedule" | "delete") => {
    switch (action) {
      case "complete": await toggleComplete(id); break;
      case "migrate": await migrateBullet(id, targetMonthly); break;
      case "schedule": await scheduleBullet(id, "future-" + currentMonthISO()); break;
      case "delete": await deleteBullet(id); break;
    }
    setProcessed((s) => new Set([...s, id]));
  };

  const remaining = incompleteTasks.filter((b) => !processed.has(b.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-page border border-border rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="font-mono text-lg font-semibold mb-1">Migration Review</h3>
        <p className="text-sm text-fg-muted mb-4">
          {remaining.length} incomplete task{remaining.length !== 1 ? "s" : ""} to review
        </p>

        <div className="space-y-2">
          {remaining.map((bullet) => (
            <div key={bullet.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-bg/50">
              <BulletIcon type={bullet.type} size={12} />
              <span className="flex-1 text-sm font-mono">{bullet.text}</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleAction(bullet.id, "complete")}
                  className="px-2.5 py-1 text-[10px] font-mono rounded bg-accent-soft text-fg-muted hover:text-fg transition-colors"
                  title="Mark as done"
                >× Done</button>
                <button
                  onClick={() => handleAction(bullet.id, "migrate")}
                  className="px-2.5 py-1 text-[10px] font-mono rounded bg-accent-soft text-fg-muted hover:text-fg transition-colors"
                  title="Move to this month's task list"
                >› Migrate</button>
                <button
                  onClick={() => handleAction(bullet.id, "schedule")}
                  className="px-2.5 py-1 text-[10px] font-mono rounded bg-accent-soft text-fg-muted hover:text-fg transition-colors"
                  title="Schedule to future log"
                >‹ Schedule</button>
                <button
                  onClick={() => handleAction(bullet.id, "delete")}
                  className="px-2.5 py-1 text-[10px] font-mono rounded bg-accent-soft text-fg-faint hover:text-priority transition-colors"
                  title="Remove this task"
                >✕ Delete</button>
              </div>
            </div>
          ))}
        </div>

        {remaining.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-fg-muted mb-3">All tasks reviewed!</p>
            <button onClick={onClose} className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent/90">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
