"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import { BulletType, Signifier, type Bullet, type ThreadLink } from "@/lib/types";
import { useBulletStore } from "@/lib/store/bulletStore";
import BulletIcon from "./BulletIcon";

function threadLinkHref(link: ThreadLink): string {
  const id = link.targetParentId;
  if (id.startsWith("daily-")) return `/daily/${id.replace("daily-", "")}`;
  if (id.startsWith("monthly-")) return `/monthly/${id.replace("monthly-", "")}`;
  if (id.startsWith("collection-")) return `/collections/${id.replace("collection-", "")}`;
  if (id.startsWith("future-")) return "/future-log";
  return "/overview";
}

interface BulletEntryProps {
  bullet: Bullet;
  focused: boolean;
  onFocus: () => void;
  editingFromParent?: boolean;
  onEditDone?: () => void;
}

export default function BulletEntry({ bullet, focused, onFocus, editingFromParent, onEditDone }: BulletEntryProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(bullet.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const { updateBullet, toggleComplete, deleteBullet } = useBulletStore();

  const isComplete = bullet.type === BulletType.TaskComplete;
  const isMigrated = bullet.type === BulletType.TaskMigrated;
  const isScheduled = bullet.type === BulletType.TaskScheduled;
  const dimmed = isComplete || isMigrated || isScheduled;

  // Scroll into view when focused
  useEffect(() => {
    if (focused && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [focused]);

  // Start editing from parent (Enter/e key)
  useEffect(() => {
    if (editingFromParent && !editing) {
      setEditing(true);
      setEditText(bullet.text);
    }
  }, [editingFromParent]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    if (editText.trim()) {
      updateBullet(bullet.id, { text: editText.trim() });
    }
    setEditing(false);
    onEditDone?.();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditText(bullet.text);
      setEditing(false);
      onEditDone?.();
    }
  };

  return (
    <div
      ref={rowRef}
      className={`group flex items-start gap-2 py-1 px-2 rounded-md transition-all cursor-default bullet-enter ${
        focused ? "bg-accent-soft/60" : "hover:bg-accent-soft/30"
      }`}
      style={{ paddingLeft: `${bullet.indentLevel * 24 + 8}px` }}
      onClick={onFocus}
      onDoubleClick={() => setEditing(true)}
    >
      {/* Signifiers */}
      {bullet.signifiers.includes(Signifier.Priority) && (
        <span className="text-priority text-xs font-bold mt-0.5 shrink-0" title="Priority">*</span>
      )}
      {bullet.signifiers.includes(Signifier.Inspiration) && (
        <span className="text-inspiration text-xs font-bold mt-0.5 shrink-0" title="Inspiration">!</span>
      )}

      {/* Bullet icon */}
      <div className="mt-0.5">
        <BulletIcon
          type={bullet.type}
          onClick={() => {
            if (bullet.type === BulletType.Task || bullet.type === BulletType.TaskComplete) {
              toggleComplete(bullet.id);
            }
          }}
        />
      </div>

      {/* Text */}
      {editing ? (
        <input
          ref={inputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm text-fg outline-none font-mono border-b border-accent py-0"
        />
      ) : (
        <span
          className={`flex-1 text-sm font-mono leading-relaxed ${
            dimmed ? "line-through text-fg-faint" : "text-fg"
          }`}
        >
          {bullet.text}
        </span>
      )}

      {/* Thread links — clickable, navigate to threaded page */}
      {bullet.threadLinks.length > 0 && !editing && (
        <div className="flex items-center gap-1 shrink-0">
          {bullet.threadLinks.map((link, i) => (
            <Link
              key={i}
              href={threadLinkHref(link)}
              className="text-[9px] font-mono text-accent bg-accent-soft/50 px-1.5 py-0.5 rounded hover:bg-accent-soft transition-colors"
              title={`Go to: ${link.label || link.targetParentId}`}
              onClick={(e) => e.stopPropagation()}
            >
              {link.label || "link"}
            </Link>
          ))}
        </div>
      )}

      {/* Action hints on hover */}
      {focused && !editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-fg-faint hover:text-fg px-1"
            title="Edit (e)"
          >
            edit
          </button>
          <button
            onClick={() => deleteBullet(bullet.id)}
            className="text-[10px] text-fg-faint hover:text-priority px-1"
            title="Delete (dd)"
          >
            del
          </button>
        </div>
      )}
    </div>
  );
}
