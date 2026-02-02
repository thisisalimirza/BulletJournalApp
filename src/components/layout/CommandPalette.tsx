"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useNavigationStore } from "@/lib/store/navigationStore";
import { useBulletStore } from "@/lib/store/bulletStore";
import { todayISO, currentMonthISO } from "@/lib/dates";

interface Command {
  id: string;
  label: string;
  hint?: string;
  action: () => void;
}

export default function CommandPalette() {
  const router = useRouter();
  const commandPaletteOpen = useNavigationStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useNavigationStore((s) => s.setCommandPaletteOpen);
  const theme = useNavigationStore((s) => s.theme);
  const setTheme = useNavigationStore((s) => s.setTheme);
  const scopesMap = useBulletStore((s) => s.scopes);
  const scopes = useMemo(() => Object.values(scopesMap), [scopesMap]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [
      { id: "index", label: "Go to Index", hint: "g i", action: () => router.push("/index") },
      { id: "future", label: "Go to Future Log", hint: "g f", action: () => router.push("/future-log") },
      { id: "monthly", label: "Go to Monthly Log", hint: "g m", action: () => router.push(`/monthly/${currentMonthISO()}`) },
      { id: "daily-today", label: "Go to Today", hint: "g d", action: () => router.push(`/daily/${todayISO()}`) },
      { id: "collections", label: "Go to Collections", hint: "g c", action: () => router.push("/collections") },
      { id: "theme", label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`, hint: "⌘D", action: () => setTheme(theme === "dark" ? "light" : "dark") },
    ];

    // Add scope navigation
    scopes.forEach((scope) => {
      if (scope.type === "daily") {
        cmds.push({
          id: scope.id,
          label: `Daily: ${scope.label}`,
          action: () => router.push(`/daily/${scope.date}`),
        });
      } else if (scope.type === "collection") {
        cmds.push({
          id: scope.id,
          label: `Collection: ${scope.label}`,
          action: () => router.push(`/collections/${scope.id.replace("collection-", "")}`),
        });
      }
    });

    return cmds;
  }, [theme, scopes, router, setTheme]);

  const allBullets = useBulletStore((s) => s.bullets);

  const filtered = useMemo(() => {
    if (!query) return commands.slice(0, 10);
    const q = query.toLowerCase();
    const cmdResults = commands.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 6);

    // Search bullet text when query is 2+ chars
    if (q.length >= 2) {
      const bulletResults = Object.values(allBullets)
        .filter((b) => b.text.toLowerCase().includes(q))
        .slice(0, 10 - cmdResults.length)
        .map((b): Command => {
          const scope = scopesMap[b.parentId];
          const hint = scope ? scope.label : "";
          // Determine href from parent scope
          let href = "/";
          if (scope) {
            if (scope.type === "daily") href = `/daily/${scope.date}`;
            else if (scope.type === "monthly") href = `/monthly/${scope.date}`;
            else if (scope.type === "future") href = "/future-log";
            else if (scope.type === "collection") href = `/collections/${scope.id.replace("collection-", "")}`;
          }
          return { id: `bullet-${b.id}`, label: b.text, hint, action: () => router.push(href) };
        });
      return [...cmdResults, ...bulletResults];
    }

    return cmdResults;
  }, [query, commands, allBullets, scopesMap, router]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]!.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  const executeCommand = (cmd: Command) => {
    cmd.action();
    setCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "j":
        if (e.key === "j" && !e.ctrlKey) break;
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
      case "k":
        if (e.key === "k" && !e.ctrlKey) break;
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[selectedIndex]) executeCommand(filtered[selectedIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setCommandPaletteOpen(false);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setCommandPaletteOpen(false)}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-bg-page border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fg-muted shrink-0">
            <circle cx="7" cy="7" r="5" />
            <line x1="11" y1="11" x2="14" y2="14" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, entries..."
            className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
          />
          <kbd className="text-[10px] font-mono text-fg-faint bg-bg px-1.5 py-0.5 rounded">esc</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              ref={(el) => { itemRefs.current[i] = el; }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                i === selectedIndex ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-accent-soft/50"
              }`}
              onClick={() => executeCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span>{cmd.label}</span>
              {cmd.hint && (
                <kbd className="text-[10px] font-mono text-fg-faint bg-bg px-1.5 py-0.5 rounded">{cmd.hint}</kbd>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-sm text-fg-faint text-center">No results</p>
          )}
        </div>
      </div>
    </div>
  );
}
