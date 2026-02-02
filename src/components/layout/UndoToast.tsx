"use client";

import { useEffect, useRef } from "react";
import { useUndoStore } from "@/lib/store/undoStore";

export default function UndoToast() {
  const toast = useUndoStore((s) => s.toast);
  const clearToast = useUndoStore((s) => s.clearToast);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(clearToast, 5000);
    return () => clearTimeout(timerRef.current);
  }, [toast, clearToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && toast) {
        e.preventDefault();
        toast.undo();
        clearToast();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-bg-page border border-border rounded-lg px-4 py-2.5 shadow-xl font-mono text-sm animate-in slide-in-from-bottom-4">
      <span className="text-fg-muted">{toast.label}</span>
      <button
        onClick={() => { toast.undo(); clearToast(); }}
        className="text-accent hover:text-accent/80 font-semibold transition-colors"
      >
        Undo
      </button>
      <span className="text-fg-faint text-[10px]">⌘Z</span>
    </div>
  );
}
