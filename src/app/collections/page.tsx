"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import PageShell from "@/components/layout/PageShell";
import { useBulletStore } from "@/lib/store/bulletStore";
import type { CollectionSubType } from "@/lib/types";

export default function CollectionsPage() {
  const scopesMap = useBulletStore((s) => s.scopes);
  const scopes = useMemo(
    () => Object.values(scopesMap).filter((sc) => sc.type === "collection").sort((a, b) => a.sortOrder - b.sortOrder),
    [scopesMap]
  );
  const ensureScope = useBulletStore((s) => s.ensureScope);
  const updateScope = useBulletStore((s) => s.updateScope);
  const deleteScope = useBulletStore((s) => s.deleteScope);
  const bullets = useBulletStore((s) => s.bullets);
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CollectionSubType>("list");
  const [focusIndex, setFocusIndex] = useState(-1);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusIndex >= 0 && rowRefs.current[focusIndex]) {
      rowRefs.current[focusIndex]!.scrollIntoView({ block: "nearest" });
    }
  }, [focusIndex]);

  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (scopes.length === 0) return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((i) => (i < 0 ? 0 : Math.min(i + 1, scopes.length - 1)));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          if (focusIndex >= 0 && focusIndex < scopes.length) {
            e.preventDefault();
            router.push(`/collections/${scopes[focusIndex].id.replace("collection-", "")}`);
          }
          break;
        case "Escape":
          e.preventDefault();
          setFocusIndex(-1);
          break;
        case "r":
          if (focusIndex >= 0 && focusIndex < scopes.length) {
            e.preventDefault();
            const scope = scopes[focusIndex];
            setRenamingId(scope.id);
            setRenameText(scope.label);
          }
          break;
        case "D":
          if (focusIndex >= 0 && focusIndex < scopes.length) {
            e.preventDefault();
            const scope = scopes[focusIndex];
            if (confirm(`Delete "${scope.label}" and all its entries?`)) {
              deleteScope(scope.id);
              setFocusIndex((i) => Math.min(i, scopes.length - 2));
            }
          }
          break;
      }
    },
    [scopes, focusIndex, router, deleteScope]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const id = nanoid(8);
    await ensureScope({
      id: `collection-${id}`,
      type: "collection",
      label: newName.trim(),
      collectionSubType: newType,
    });
    setNewName("");
    setNewType("list");
  };

  const handleRename = async () => {
    if (renamingId && renameText.trim()) {
      await updateScope(renamingId, { label: renameText.trim() });
    }
    setRenamingId(null);
  };

  return (
    <PageShell title="Collections" subtitle="Custom lists and trackers">
      <div className="space-y-2 mb-6">
        {scopes.map((scope, i) => {
          const count = Object.values(bullets).filter((b) => b.parentId === scope.id).length;
          const focused = i === focusIndex;
          const isRenaming = renamingId === scope.id;
          const subType = scope.collectionSubType || "list";
          return (
            <div
              key={scope.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                focused ? "border-accent bg-accent-soft/60 ring-1 ring-accent/30" : "border-border hover:bg-accent-soft/50"
              }`}
            >
              {isRenaming ? (
                <input
                  ref={renameRef}
                  value={renameText}
                  onChange={(e) => setRenameText(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="flex-1 bg-transparent text-sm font-mono text-fg outline-none border-b border-accent"
                />
              ) : (
                <Link
                  ref={(el) => { rowRefs.current[i] = el; }}
                  href={`/collections/${scope.id.replace("collection-", "")}`}
                  className="flex-1 flex items-center gap-2"
                  onClick={() => setFocusIndex(i)}
                >
                  <span className="text-xs text-fg-faint">{subType === "habit-tracker" ? "▦" : "▤"}</span>
                  <span className="font-mono text-sm text-fg">{scope.label}</span>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-faint">{count} entries</span>
                {focused && !isRenaming && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setRenamingId(scope.id); setRenameText(scope.label); }}
                      className="text-[10px] text-fg-faint hover:text-fg px-1"
                      title="Rename (r)"
                    >
                      rename
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${scope.label}" and all its entries?`)) deleteScope(scope.id);
                      }}
                      className="text-[10px] text-fg-faint hover:text-priority px-1"
                      title="Delete (Shift+D)"
                    >
                      del
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {scopes.length === 0 && (
          <p className="text-sm text-fg-faint font-mono py-4 text-center">No collections yet</p>
        )}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New collection name..."
            className="flex-1 bg-transparent text-sm font-mono text-fg placeholder:text-fg-faint/50 outline-none border-b border-border py-2"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as CollectionSubType)}
            className="bg-transparent text-xs font-mono text-fg-muted border border-border rounded px-2 py-1.5"
          >
            <option value="list">List</option>
            <option value="habit-tracker">Habit Tracker</option>
          </select>
          <button
            onClick={handleCreate}
            className="px-3 py-1.5 text-sm font-mono bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </PageShell>
  );
}
