"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBulletStore } from "@/lib/store/bulletStore";
import BulletList from "@/components/bullet/BulletList";
import HabitTracker from "@/components/modules/HabitTracker";

interface CollectionViewProps {
  id: string;
  name: string;
}

export default function CollectionView({ id, name }: CollectionViewProps) {
  const ensureScope = useBulletStore((s) => s.ensureScope);
  const updateScope = useBulletStore((s) => s.updateScope);
  const deleteScope = useBulletStore((s) => s.deleteScope);
  const scope = useBulletStore((s) => s.scopes[`collection-${id}`]);
  const router = useRouter();
  const scopeId = `collection-${id}`;

  const [renaming, setRenaming] = useState(false);
  const [renameText, setRenameText] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ensureScope({ id: scopeId, type: "collection", label: name });
  }, [id, scopeId, name, ensureScope]);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const handleRename = async () => {
    if (renameText.trim() && renameText.trim() !== name) {
      await updateScope(scopeId, { label: renameText.trim() });
    }
    setRenaming(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${name}" and all its entries?`)) {
      await deleteScope(scopeId);
      router.push("/collections");
    }
  };

  const isHabitTracker = scope?.collectionSubType === "habit-tracker";

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {renaming ? (
          <input
            ref={inputRef}
            value={renameText}
            onChange={(e) => setRenameText(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") { setRenameText(name); setRenaming(false); }
            }}
            className="font-mono text-lg font-semibold text-fg bg-transparent outline-none border-b border-accent"
          />
        ) : (
          <h3 className="font-mono text-lg font-semibold text-fg">{name}</h3>
        )}
        <span className="text-xs text-fg-faint bg-accent-soft px-2 py-0.5 rounded">
          {isHabitTracker ? "habit tracker" : "list"}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => { setRenameText(name); setRenaming(true); }}
          className="text-xs text-fg-faint hover:text-fg font-mono"
        >
          rename
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-fg-faint hover:text-priority font-mono"
        >
          delete
        </button>
      </div>
      {isHabitTracker ? (
        <HabitTracker parentId={scopeId} />
      ) : (
        <BulletList parentId={scopeId} showInput />
      )}
    </div>
  );
}
