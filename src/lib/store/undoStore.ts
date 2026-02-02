import { create } from "zustand";

export interface UndoEntry {
  id: string;
  label: string;
  undo: () => Promise<void> | void;
}

interface UndoStore {
  toast: UndoEntry | null;
  pushUndo: (entry: UndoEntry) => void;
  clearToast: () => void;
}

export const useUndoStore = create<UndoStore>((set) => ({
  toast: null,
  pushUndo: (entry) => set({ toast: entry }),
  clearToast: () => set({ toast: null }),
}));
