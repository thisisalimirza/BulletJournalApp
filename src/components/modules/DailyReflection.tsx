"use client";

import { useState, useMemo } from "react";
import { useBulletStore } from "@/lib/store/bulletStore";
import { BulletType, Signifier } from "@/lib/types";

const PROMPTS = [
  "What went well today?",
  "What could I improve tomorrow?",
  "What am I grateful for?",
  "What did I learn today?",
  "What's one thing I want to remember about today?",
  "How did I feel today and why?",
  "What challenged me today?",
  "What's one step closer to my goals?",
  "Did I spend my time intentionally today?",
  "What would I do differently if I could redo today?",
];

interface DailyReflectionProps {
  parentId: string;
  date: string;
}

export default function DailyReflection({ parentId, date }: DailyReflectionProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const addBullet = useBulletStore((s) => s.addBullet);
  const allBullets = useBulletStore((s) => s.bullets);

  // Deterministic prompt based on date
  const prompt = useMemo(() => {
    const dayNum = date.split("-").map(Number).reduce((a, b) => a + b, 0);
    return PROMPTS[dayNum % PROMPTS.length];
  }, [date]);

  const reflections = useMemo(
    () => Object.values(allBullets)
      .filter((b) => b.parentId === parentId && b.signifiers.includes(Signifier.Inspiration))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [allBullets, parentId]
  );

  const handleAdd = async () => {
    if (!text.trim()) return;
    await addBullet({
      type: BulletType.Note,
      signifiers: [Signifier.Inspiration],
      text: text.trim(),
      parentId,
      indentLevel: 0,
    });
    setText("");
  };

  return (
    <div className="mt-6 border-t border-border pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-mono text-fg-muted hover:text-fg transition-colors"
      >
        <span className="text-xs">{open ? "▾" : "▸"}</span>
        <span>Reflection</span>
        {reflections.length > 0 && (
          <span className="text-[10px] text-fg-faint">({reflections.length})</span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-fg-faint font-mono italic">{prompt}</p>

          {reflections.map((r) => (
            <div key={r.id} className="flex items-start gap-2 text-sm font-mono text-fg-muted py-1 px-2">
              <span className="text-inspiration text-xs mt-0.5">!</span>
              <span>{r.text}</span>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Write a reflection..."
              className="flex-1 bg-transparent text-sm font-mono text-fg placeholder:text-fg-faint/50 outline-none border-b border-border py-1"
            />
            <button
              onClick={handleAdd}
              className="px-2 py-1 text-xs font-mono bg-accent text-white rounded hover:bg-accent/90 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
