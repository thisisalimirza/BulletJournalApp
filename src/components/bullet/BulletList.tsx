"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useBulletStore } from "@/lib/store/bulletStore";
import { BulletType } from "@/lib/types";
import { currentMonthISO, monthlyScopeId } from "@/lib/dates";
import BulletEntry from "./BulletEntry";
import BulletInput from "./BulletInput";
import ThreadPicker from "./ThreadPicker";

interface BulletListProps {
  parentId: string;
  showInput?: boolean;
  compact?: boolean;
  active?: boolean;
}

export default function BulletList({ parentId, showInput = true, compact = false, active = true }: BulletListProps) {
  const allBullets = useBulletStore((s) => s.bullets);
  const bullets = useMemo(
    () => Object.values(allBullets)
      .filter((b) => b.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [allBullets, parentId]
  );
  const toggleComplete = useBulletStore((s) => s.toggleComplete);
  const updateBullet = useBulletStore((s) => s.updateBullet);
  const deleteBullet = useBulletStore((s) => s.deleteBullet);
  const migrateBullet = useBulletStore((s) => s.migrateBullet);
  const scheduleBullet = useBulletStore((s) => s.scheduleBullet);
  const reorderBullet = useBulletStore((s) => s.reorderBullet);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [threadPickerId, setThreadPickerId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingD = useRef(false);
  const dTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Expose a way for BulletInput to register its ref
  const bulletInputRef = useRef<{ focus: () => void } | null>(null);

  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (!active) return;
      if (bullets.length === 0 && !["o", "ArrowDown"].includes(e.key)) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Don't handle if editing
      if (editingIndex >= 0) return;

      // Alt+j/k or Alt+Arrow for reordering
      if (e.altKey && (e.key === "j" || e.key === "ArrowDown")) {
        if (focusIndex >= 0 && focusIndex < bullets.length) {
          e.preventDefault();
          reorderBullet(bullets[focusIndex].id, "down");
          setFocusIndex((i) => Math.min(i + 1, bullets.length - 1));
        }
        return;
      }
      if (e.altKey && (e.key === "k" || e.key === "ArrowUp")) {
        if (focusIndex >= 0 && focusIndex < bullets.length) {
          e.preventDefault();
          reorderBullet(bullets[focusIndex].id, "up");
          setFocusIndex((i) => Math.max(i - 1, 0));
        }
        return;
      }

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((i) => {
            if (i < 0) return 0;
            return Math.min(i + 1, bullets.length - 1);
          });
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - 1, 0));
          break;
        case "Escape":
          e.preventDefault();
          setFocusIndex(-1);
          break;
        case "x":
          if (focusIndex >= 0 && focusIndex < bullets.length) {
            e.preventDefault();
            toggleComplete(bullets[focusIndex].id);
          }
          break;
        case "e":
        case "Enter":
          if (focusIndex >= 0 && focusIndex < bullets.length) {
            e.preventDefault();
            setEditingIndex(focusIndex);
          }
          break;
        case "Backspace":
        case "Delete":
          if (focusIndex >= 0 && focusIndex < bullets.length) {
            e.preventDefault();
            deleteBullet(bullets[focusIndex].id);
            setFocusIndex((i) => Math.min(i, bullets.length - 2));
          }
          break;
        case "d":
          if (focusIndex >= 0 && focusIndex < bullets.length) {
            if (pendingD.current) {
              // dd — delete
              e.preventDefault();
              clearTimeout(dTimeout.current);
              pendingD.current = false;
              const id = bullets[focusIndex].id;
              deleteBullet(id);
              setFocusIndex((i) => Math.min(i, bullets.length - 2));
            } else {
              pendingD.current = true;
              dTimeout.current = setTimeout(() => { pendingD.current = false; }, 500);
            }
          }
          break;
        case "o":
          e.preventDefault();
          // Focus the BulletInput
          bulletInputRef.current?.focus();
          setFocusIndex(-1);
          break;
        case ">":
          // Migrate focused task to current monthly log
          if (focusIndex >= 0 && focusIndex < bullets.length) {
            const b = bullets[focusIndex];
            if (b.type === BulletType.Task) {
              e.preventDefault();
              migrateBullet(b.id, monthlyScopeId(currentMonthISO()));
            }
          }
          break;
        case "<":
          // Schedule focused task to future log
          if (focusIndex >= 0 && focusIndex < bullets.length) {
            const b = bullets[focusIndex];
            if (b.type === BulletType.Task) {
              e.preventDefault();
              scheduleBullet(b.id, `future-${currentMonthISO()}`);
            }
          }
          break;
        case "t":
          if (focusIndex >= 0 && focusIndex < bullets.length) {
            e.preventDefault();
            setThreadPickerId(bullets[focusIndex].id);
          }
          break;
        case "Tab":
          if (focusIndex >= 0 && focusIndex < bullets.length) {
            e.preventDefault();
            const b = bullets[focusIndex];
            const newLevel = e.shiftKey
              ? Math.max(0, b.indentLevel - 1)
              : Math.min(3, b.indentLevel + 1);
            updateBullet(b.id, { indentLevel: newLevel });
          }
          break;
      }
    },
    [active, bullets, focusIndex, editingIndex, toggleComplete, updateBullet, deleteBullet, migrateBullet, scheduleBullet, reorderBullet]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (bullets.length === 0 && !showInput) {
    return <p className="text-sm text-fg-faint font-mono italic py-2">No entries yet</p>;
  }

  return (
    <div className={compact ? "space-y-0" : ""}>
      {bullets.length === 0 && showInput && !compact && (
        <div className="text-xs font-mono text-fg-faint/70 py-3 px-2 space-y-1.5">
          <p className="text-fg-muted font-medium">Start typing below to rapid log:</p>
          <p><span className="text-fg-faint">just type</span> → task (•)</p>
          <p><span className="text-fg-faint">- text</span> → note (—)</p>
          <p><span className="text-fg-faint">o text</span> → event (○)</p>
          <p><span className="text-fg-faint">* text</span> → priority task</p>
          <p className="pt-1 text-fg-faint/50">Press ? for all keyboard shortcuts</p>
        </div>
      )}
      {bullets.map((bullet, i) => (
        <BulletEntry
          key={bullet.id}
          bullet={bullet}
          focused={i === focusIndex}
          onFocus={() => setFocusIndex(i)}
          editingFromParent={i === editingIndex}
          onEditDone={() => setEditingIndex(-1)}
        />
      ))}
      {showInput && (
        <BulletInput
          parentId={parentId}
          ref={bulletInputRef}
          onFocusUp={() => {
            if (bullets.length > 0) {
              setFocusIndex(bullets.length - 1);
            }
          }}
        />
      )}
      {threadPickerId && (
        <ThreadPicker bulletId={threadPickerId} onClose={() => setThreadPickerId(null)} />
      )}
    </div>
  );
}
