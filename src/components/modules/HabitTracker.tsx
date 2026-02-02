"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useBulletStore } from "@/lib/store/bulletStore";
import { BulletType, Signifier } from "@/lib/types";
import { currentMonthISO, getDaysInMonth, todayISO as getTodayISO } from "@/lib/dates";

function EditableHabitName({ text, onSave }: { text: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.select(); }, [editing]);

  if (!editing) {
    return (
      <span
        className="truncate max-w-[180px] cursor-text hover:text-accent transition-colors"
        title={`${text} (click to edit)`}
        onClick={() => { setValue(text); setEditing(true); }}
      >
        {text}
      </span>
    );
  }

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== text) onSave(trimmed);
    setEditing(false);
  };

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
      className="bg-transparent text-sm font-mono text-fg outline-none border-b border-accent w-[180px]"
    />
  );
}

interface HabitTrackerProps {
  parentId: string;
}

export default function HabitTracker({ parentId }: HabitTrackerProps) {
  const allBullets = useBulletStore((s) => s.bullets);
  const addBullet = useBulletStore((s) => s.addBullet);
  const updateBullet = useBulletStore((s) => s.updateBullet);
  const deleteBullet = useBulletStore((s) => s.deleteBullet);
  const toggleHabitCheck = useBulletStore((s) => s.toggleHabitCheck);
  const [newHabit, setNewHabit] = useState("");
  const [month] = useState(currentMonthISO);
  const inputRef = useRef<HTMLInputElement>(null);

  const habits = useMemo(
    () => Object.values(allBullets)
      .filter((b) => b.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [allBullets, parentId]
  );

  const days = useMemo(() => getDaysInMonth(month), [month]);

  const [focusRow, setFocusRow] = useState(-1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (habits.length === 0) return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setFocusRow((i) => (i < 0 ? 0 : Math.min(i + 1, habits.length - 1)));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setFocusRow((i) => Math.max(i - 1, 0));
          break;
        case "o":
          e.preventDefault();
          inputRef.current?.focus();
          setFocusRow(-1);
          break;
        case "Escape":
          e.preventDefault();
          setFocusRow(-1);
          break;
      }
    },
    [habits]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleAdd = async () => {
    if (!newHabit.trim()) return;
    await addBullet({
      type: BulletType.Task,
      signifiers: [],
      text: newHabit.trim(),
      parentId,
      indentLevel: 0,
    });
    setNewHabit("");
  };

  const today = getTodayISO();

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="font-mono text-xs w-full">
          <thead>
            <tr>
              <th className="text-left text-fg-muted font-medium py-1 pr-4 sticky left-0 bg-bg-page min-w-[200px]">
                Habit
              </th>
              {days.map((d) => (
                <th
                  key={d.iso}
                  className={`text-center px-0.5 py-1 min-w-[22px] ${
                    d.iso === today ? "text-accent font-bold" : "text-fg-faint"
                  }`}
                >
                  <div>{d.day}</div>
                  <div className="text-[9px]">{d.letter}</div>
                </th>
              ))}
              <th className="text-center text-fg-muted px-2 py-1">%</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, i) => {
              const checks = habit.habitChecks || {};
              const checkedCount = days.filter((d) => checks[d.iso]).length;
              const pct = days.length > 0 ? Math.round((checkedCount / days.length) * 100) : 0;
              const focused = i === focusRow;
              return (
                <tr
                  key={habit.id}
                  className={`transition-colors ${focused ? "bg-accent-soft/60" : "hover:bg-accent-soft/30"}`}
                >
                  <td className="text-fg text-sm py-1 pr-4 sticky left-0 bg-inherit">
                    <div className="flex items-center gap-1">
                      <EditableHabitName text={habit.text} onSave={(v) => updateBullet(habit.id, { text: v })} />
                      {focused && (
                        <button
                          onClick={() => { if (confirm(`Remove "${habit.text}"?`)) deleteBullet(habit.id); }}
                          className="text-[9px] text-fg-faint hover:text-priority ml-1"
                        >
                          x
                        </button>
                      )}
                    </div>
                  </td>
                  {days.map((d) => {
                    const checked = checks[d.iso] || false;
                    return (
                      <td key={d.iso} className="text-center px-0.5 py-1">
                        <button
                          onClick={() => toggleHabitCheck(habit.id, d.iso)}
                          className={`w-4 h-4 rounded-sm border transition-colors ${
                            checked
                              ? "bg-accent border-accent text-white"
                              : "border-border hover:border-fg-faint"
                          }`}
                        >
                          {checked && <span className="text-[9px]">x</span>}
                        </button>
                      </td>
                    );
                  })}
                  <td className="text-center text-fg-muted px-2 py-1">
                    {pct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {habits.length === 0 && (
        <p className="text-sm text-fg-faint font-mono text-center py-4">
          Add habits below to start tracking
        </p>
      )}

      {/* Add habit input */}
      <div className="flex items-center gap-2 border-t border-border pt-3">
        <input
          ref={inputRef}
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add habit..."
          className="flex-1 bg-transparent text-sm font-mono text-fg placeholder:text-fg-faint/50 outline-none border-b border-border py-2"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 text-sm font-mono bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
