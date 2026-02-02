"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDaysInMonth, dailyScopeId, todayISO, monthlyScopeId } from "@/lib/dates";
import { useBulletStore } from "@/lib/store/bulletStore";

interface MonthlyCalendarProps {
  month: string;
  active?: boolean;
}

export default function MonthlyCalendar({ month, active = true }: MonthlyCalendarProps) {
  const bullets = useBulletStore((s) => s.bullets);
  const scopes = useBulletStore((s) => s.scopes);
  const updateScope = useBulletStore((s) => s.updateScope);
  const days = getDaysInMonth(month);
  const router = useRouter();
  const [focusIndex, setFocusIndex] = useState(-1);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const editRef = useRef<HTMLInputElement>(null);

  const scopeId = monthlyScopeId(month);
  const dayNotes = scopes[scopeId]?.dayNotes || {};

  const saveDayNote = async (dateISO: string, text: string) => {
    const trimmed = text.trim();
    const updated = { ...dayNotes };
    if (trimmed) {
      updated[dateISO] = trimmed;
    } else {
      delete updated[dateISO];
    }
    await updateScope(scopeId, { dayNotes: updated });
  };

  useEffect(() => {
    if (focusIndex >= 0 && rowRefs.current[focusIndex]) {
      rowRefs.current[focusIndex]!.scrollIntoView({ block: "nearest" });
    }
  }, [focusIndex]);

  useEffect(() => {
    if (editingDay && editRef.current) {
      editRef.current.focus();
    }
  }, [editingDay]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active) return;
      if (editingDay) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((i) => (i < 0 ? 0 : Math.min(i + 1, days.length - 1)));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          if (focusIndex >= 0 && focusIndex < days.length) {
            e.preventDefault();
            router.push(`/daily/${days[focusIndex].iso}`);
          }
          break;
        case "e":
        case "i":
          if (focusIndex >= 0 && focusIndex < days.length) {
            e.preventDefault();
            setEditingDay(days[focusIndex].iso);
          }
          break;
        case "Escape":
          e.preventDefault();
          setFocusIndex(-1);
          break;
      }
    },
    [active, days, focusIndex, editingDay, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const today = todayISO();

  return (
    <div className={`space-y-0 rounded-lg p-1 transition-colors ${active ? "ring-1 ring-accent/30" : "opacity-70"}`}>
      {days.map(({ day, letter, iso }, i) => {
        const dailyId = dailyScopeId(iso);
        const count = Object.values(bullets).filter((b) => b.parentId === dailyId).length;
        const isToday = iso === today;
        const focused = i === focusIndex;
        const note = dayNotes[iso] || "";
        const isEditing = editingDay === iso;

        return (
          <div
            key={iso}
            ref={(el) => { rowRefs.current[i] = el; }}
            onClick={() => { if (!isEditing) setEditingDay(iso); }}
            className={`flex items-center gap-2 py-1 px-2 rounded text-sm font-mono transition-colors cursor-text ${
              focused ? "bg-accent-soft/60 ring-1 ring-accent/30" : isToday ? "bg-accent-soft font-semibold" : "hover:bg-accent-soft/30"
            }`}
          >
            <Link
              href={`/daily/${iso}`}
              className="flex items-center gap-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="w-6 text-right text-fg-muted">{day}</span>
              <span className="w-4 text-fg-faint">{letter}</span>
              {count > 0 && (
                <span className="w-2 h-2 rounded-full bg-accent shrink-0" title={`${count} entries`} />
              )}
            </Link>
            {isEditing ? (
              <input
                ref={editRef}
                defaultValue={note}
                onBlur={(e) => { saveDayNote(iso, e.target.value); setEditingDay(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { saveDayNote(iso, e.currentTarget.value); setEditingDay(null); }
                  if (e.key === "Escape") setEditingDay(null);
                }}
                className="flex-1 bg-transparent text-xs text-fg outline-none border-b border-accent min-w-0"
                placeholder="Add note..."
              />
            ) : (
              <span className="flex-1 text-xs text-fg-faint truncate min-w-0">
                {note || "\u00A0"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
