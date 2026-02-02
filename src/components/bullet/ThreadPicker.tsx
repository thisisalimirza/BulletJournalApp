"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useBulletStore } from "@/lib/store/bulletStore";
import type { PageScope } from "@/lib/types";

interface ThreadPickerProps {
  bulletId: string;
  onClose: () => void;
}

export default function ThreadPicker({ bulletId, onClose }: ThreadPickerProps) {
  const scopesMap = useBulletStore((s) => s.scopes);
  const addThreadLink = useBulletStore((s) => s.addThreadLink);
  const bullet = useBulletStore((s) => s.bullets[bulletId]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const scopes = useMemo(() => {
    const all = Object.values(scopesMap).sort((a, b) => a.sortOrder - b.sortOrder);
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((s) => s.label.toLowerCase().includes(q));
  }, [scopesMap, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]!.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const existingLinks = new Set(bullet?.threadLinks?.map((l) => l.targetParentId) || []);

  const handleSelect = async (scope: PageScope) => {
    if (existingLinks.has(scope.id)) {
      onClose();
      return;
    }
    await addThreadLink(bulletId, {
      targetBulletId: "",
      targetParentId: scope.id,
      label: scope.label,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, scopes.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (scopes[selectedIndex]) handleSelect(scopes[selectedIndex]);
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg border border-border rounded-xl shadow-2xl p-4 max-w-sm w-full mx-4">
        <h3 className="font-mono text-sm font-semibold text-fg mb-3">Thread to page</h3>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages..."
          className="w-full bg-transparent text-sm font-mono text-fg placeholder:text-fg-faint/50 outline-none border-b border-border pb-2 mb-2"
        />
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {scopes.map((scope, i) => {
            const linked = existingLinks.has(scope.id);
            return (
              <button
                key={scope.id}
                ref={(el) => { itemRefs.current[i] = el; }}
                onClick={() => handleSelect(scope)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm font-mono transition-colors flex items-center justify-between ${
                  i === selectedIndex ? "bg-accent-soft/60 text-fg" : "text-fg-muted hover:bg-accent-soft/30"
                }`}
              >
                <span className="truncate">{scope.label}</span>
                <span className="text-[10px] text-fg-faint">{scope.type}</span>
                {linked && <span className="text-[10px] text-accent ml-1">linked</span>}
              </button>
            );
          })}
          {scopes.length === 0 && (
            <p className="text-xs text-fg-faint text-center py-2">No matching pages</p>
          )}
        </div>
      </div>
    </div>
  );
}
