"use client";

import { useState, useEffect } from "react";
import { useNavigationStore } from "@/lib/store/navigationStore";

const SHORTCUT_GROUPS = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: "g d", desc: "Go to today's daily log" },
      { keys: "g m", desc: "Go to current month" },
      { keys: "g f", desc: "Go to future log" },
      { keys: "g i", desc: "Go to index" },
      { keys: "g c", desc: "Go to collections" },
      { keys: "← →", desc: "Previous / next day or month" },
      { keys: "[ ]", desc: "Previous / next (alt)" },
      { keys: "`", desc: "Toggle calendar/tasks (monthly)" },
      { keys: "⌘ K", desc: "Command palette" },
    ],
  },
  {
    title: "Bullet List",
    shortcuts: [
      { keys: "j / ↓", desc: "Move focus down" },
      { keys: "k / ↑", desc: "Move focus up" },
      { keys: "Enter / e", desc: "Edit focused bullet" },
      { keys: "x", desc: "Toggle complete" },
      { keys: "d d", desc: "Delete focused bullet" },
      { keys: "o", desc: "New bullet (focus input)" },
      { keys: "Tab", desc: "Indent" },
      { keys: "⇧ Tab", desc: "Outdent" },
      { keys: ">", desc: "Migrate task to monthly log" },
      { keys: "<", desc: "Schedule task to future log" },
      { keys: "t", desc: "Thread bullet to another page" },
      { keys: "⌥ j / ⌥ ↓", desc: "Move bullet down" },
      { keys: "⌥ k / ⌥ ↑", desc: "Move bullet up" },
      { keys: "Esc", desc: "Clear focus" },
    ],
  },
  {
    title: "Collections",
    shortcuts: [
      { keys: "r", desc: "Rename focused collection" },
      { keys: "⇧ D", desc: "Delete focused collection" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: "⌘ D", desc: "Toggle dark mode" },
      { keys: "?", desc: "Show this help" },
    ],
  },
];

const BULLET_TYPES = [
  { symbol: "•", prefix: "just type", desc: "Task" },
  { symbol: "×", prefix: "x key", desc: "Completed" },
  { symbol: ">", prefix: "> key", desc: "Migrated to monthly" },
  { symbol: "<", prefix: "< key", desc: "Scheduled to future" },
  { symbol: "○", prefix: "o text", desc: "Event" },
  { symbol: "—", prefix: "- text", desc: "Note" },
];

const SIGNIFIERS = [
  { symbol: "*", prefix: "* text", desc: "Priority" },
  { symbol: "!", prefix: "! text", desc: "Inspiration" },
];

const HOW_IT_WORKS = [
  { title: "Index", desc: "Your table of contents — all pages auto-populate here." },
  { title: "Future Log", desc: "Plan tasks for upcoming months. Press < on any task to schedule it here." },
  { title: "Monthly Log", desc: "Calendar overview + task list. Press > on any task to migrate it here." },
  { title: "Daily Log", desc: "Your main workspace. Rapid log tasks, events, and notes each day." },
  { title: "Collections", desc: "Custom lists or habit trackers. Auto-populate in the Index." },
  { title: "Threading", desc: "Press t on any bullet to link it to another page for cross-referencing." },
  { title: "Reflection", desc: "Collapsible section on each daily log for end-of-day reflection." },
  { title: "Habit Tracker", desc: "Create a habit-tracker collection to track daily habits on a monthly grid." },
];

type Tab = "shortcuts" | "guide";

export default function ShortcutHelp() {
  const open = useNavigationStore((s) => s.shortcutHelpOpen);
  const setOpen = useNavigationStore((s) => s.setShortcutHelpOpen);
  const [tab, setTab] = useState<Tab>("shortcuts");

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "?") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative bg-bg border border-border rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTab("shortcuts")}
              className={`font-mono text-sm font-semibold transition-colors ${
                tab === "shortcuts" ? "text-fg" : "text-fg-faint hover:text-fg-muted"
              }`}
            >
              Shortcuts
            </button>
            <span className="text-fg-faint">|</span>
            <button
              onClick={() => setTab("guide")}
              className={`font-mono text-sm font-semibold transition-colors ${
                tab === "guide" ? "text-fg" : "text-fg-faint hover:text-fg-muted"
              }`}
            >
              How It Works
            </button>
          </div>
          <button onClick={() => setOpen(false)} className="text-fg-faint hover:text-fg text-sm">
            Esc
          </button>
        </div>

        {tab === "shortcuts" && (
          <div className="space-y-5">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.shortcuts.map((s) => (
                    <div key={s.keys} className="flex items-center justify-between py-1">
                      <span className="text-sm text-fg-muted">{s.desc}</span>
                      <kbd className="font-mono text-xs text-fg-faint bg-accent-soft px-2 py-0.5 rounded">
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "guide" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
                Bullet Types
              </h3>
              <p className="text-xs text-fg-faint mb-2">Type these prefixes when adding a new bullet:</p>
              <div className="space-y-1">
                {BULLET_TYPES.map((b) => (
                  <div key={b.symbol} className="flex items-center gap-3 py-1">
                    <span className="font-mono text-sm w-4 text-center text-fg">{b.symbol}</span>
                    <span className="text-sm text-fg-muted flex-1">{b.desc}</span>
                    <kbd className="font-mono text-xs text-fg-faint bg-accent-soft px-2 py-0.5 rounded">
                      {b.prefix}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
                Signifiers
              </h3>
              <div className="space-y-1">
                {SIGNIFIERS.map((b) => (
                  <div key={b.symbol} className="flex items-center gap-3 py-1">
                    <span className="font-mono text-sm w-4 text-center text-fg">{b.symbol}</span>
                    <span className="text-sm text-fg-muted flex-1">{b.desc}</span>
                    <kbd className="font-mono text-xs text-fg-faint bg-accent-soft px-2 py-0.5 rounded">
                      {b.prefix}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
                Pages
              </h3>
              <div className="space-y-2">
                {HOW_IT_WORKS.map((p) => (
                  <div key={p.title} className="py-1">
                    <span className="text-sm font-medium text-fg">{p.title}</span>
                    <p className="text-xs text-fg-faint mt-0.5">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
                Workflow
              </h3>
              <div className="text-xs text-fg-muted space-y-1.5 leading-relaxed">
                <p>1. Start each day on the <strong>Daily Log</strong> — rapid log tasks, events, and notes.</p>
                <p>2. At month&apos;s end, review incomplete tasks. Press <kbd className="font-mono bg-accent-soft px-1 rounded">x</kbd> to complete, <kbd className="font-mono bg-accent-soft px-1 rounded">{'>'}</kbd> to migrate to next month, or <kbd className="font-mono bg-accent-soft px-1 rounded">{'<'}</kbd> to schedule for the future.</p>
                <p>3. Use the <strong>Future Log</strong> for long-term planning and the <strong>Index</strong> to find anything.</p>
                <p>4. Create <strong>Collections</strong> for themed lists or <strong>Habit Trackers</strong> for daily habits.</p>
                <p>5. Press <kbd className="font-mono bg-accent-soft px-1 rounded">t</kbd> on any bullet to <strong>thread</strong> it to another page for cross-referencing.</p>
                <p>6. Use the <strong>Reflection</strong> section at the bottom of each daily log for end-of-day journaling.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
