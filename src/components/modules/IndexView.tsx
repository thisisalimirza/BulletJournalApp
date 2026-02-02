"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBulletStore } from "@/lib/store/bulletStore";

function scopeToHref(scope: { id: string; type: string; date?: string }): string {
  switch (scope.type) {
    case "monthly": return `/monthly/${scope.date}`;
    case "future": return "/future-log";
    case "collection": return `/collections/${scope.id.replace("collection-", "")}`;
    default: return "/";
  }
}

// Synthetic entry for the consolidated Future Log
interface IndexEntry {
  id: string;
  label: string;
  type: string;
  href: string;
  entryCount: number;
}

export default function IndexView() {
  const scopesMap = useBulletStore((s) => s.scopes);
  const bullets = useBulletStore((s) => s.bullets);

  // Build grouped index: Future Log → Monthly logs → Collections
  const { futureEntry, monthlyEntries, collectionEntries } = useMemo(() => {
    const allScopes = Object.values(scopesMap).filter((s) => s.type !== "daily");

    // Future Log (consolidated)
    const futureScopes = allScopes.filter((s) => s.type === "future");
    const futureCount = futureScopes.reduce(
      (sum, s) => sum + Object.values(bullets).filter((b) => b.parentId === s.id).length, 0
    );
    const futureEntry: IndexEntry = { id: "future-log", label: "Future Log", type: "future", href: "/future-log", entryCount: futureCount };

    // Monthly logs sorted by date
    const monthlyEntries: IndexEntry[] = allScopes
      .filter((s) => s.type === "monthly")
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
      .map((s) => ({
        id: s.id, label: s.label, type: s.type, href: scopeToHref(s),
        entryCount: Object.values(bullets).filter((b) => b.parentId === s.id).length,
      }));

    // Collections sorted by creation
    const collectionEntries: IndexEntry[] = allScopes
      .filter((s) => s.type === "collection")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        id: s.id, label: s.label, type: s.type, href: scopeToHref(s),
        entryCount: Object.values(bullets).filter((b) => b.parentId === s.id).length,
      }));

    return { futureEntry, monthlyEntries, collectionEntries };
  }, [scopesMap, bullets]);

  // Flat list for keyboard navigation
  const allEntries = useMemo(
    () => [futureEntry, ...monthlyEntries, ...collectionEntries],
    [futureEntry, monthlyEntries, collectionEntries]
  );
  const router = useRouter();
  const [focusIndex, setFocusIndex] = useState(-1);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (focusIndex >= 0 && rowRefs.current[focusIndex]) {
      rowRefs.current[focusIndex]!.scrollIntoView({ block: "nearest" });
    }
  }, [focusIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (allEntries.length === 0) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((i) => (i < 0 ? 0 : Math.min(i + 1, allEntries.length - 1)));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          if (focusIndex >= 0 && focusIndex < allEntries.length) {
            e.preventDefault();
            router.push(allEntries[focusIndex].href);
          }
          break;
        case "Escape":
          e.preventDefault();
          setFocusIndex(-1);
          break;
      }
    },
    [allEntries, focusIndex, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderRow = (entry: IndexEntry, globalIndex: number) => {
    const focused = globalIndex === focusIndex;
    return (
      <Link
        key={entry.id}
        ref={(el) => { rowRefs.current[globalIndex] = el; }}
        href={entry.href}
        className={`flex items-center justify-between py-2 px-3 rounded-md text-sm font-mono transition-colors group ${
          focused ? "bg-accent-soft/60 ring-1 ring-accent/30" : "hover:bg-accent-soft/50"
        }`}
      >
        <span className={`transition-colors ${focused ? "text-accent" : "text-fg group-hover:text-accent"}`}>
          {entry.label}
        </span>
        <span className="text-fg-faint text-xs">
          {entry.entryCount > 0 ? `${entry.entryCount} entries` : ""}
        </span>
      </Link>
    );
  };

  // Track global index offset for keyboard nav
  let gi = 0;

  return (
    <div className="space-y-6">
      {/* Future Log — always first */}
      <div>{renderRow(futureEntry, gi++)}</div>

      {/* Monthly Logs */}
      {monthlyEntries.length > 0 && (
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-fg-faint mb-1 px-3">Monthly Logs</h3>
          <div className="space-y-0.5">
            {monthlyEntries.map((entry) => renderRow(entry, gi++))}
          </div>
        </div>
      )}

      {/* Collections */}
      <div>
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-fg-faint mb-1 px-3">Collections</h3>
        <div className="space-y-0.5">
          {collectionEntries.map((entry) => renderRow(entry, gi++))}
          <Link
            href="/collections"
            className="flex items-center gap-2 py-2 px-3 rounded-md text-sm font-mono text-fg-faint hover:text-accent hover:bg-accent-soft/50 transition-colors"
          >
            <span>+</span>
            <span>New Collection</span>
          </Link>
        </div>
      </div>

      {allEntries.length <= 1 && monthlyEntries.length === 0 && collectionEntries.length === 0 && (
        <p className="text-sm text-fg-faint font-mono py-4 text-center">
          Your index will populate as you add entries
        </p>
      )}
    </div>
  );
}
