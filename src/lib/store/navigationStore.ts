import { create } from "zustand";

interface NavigationStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  shortcutHelpOpen: boolean;
  setShortcutHelpOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  theme: (typeof window !== "undefined" ? (localStorage.getItem("bujo-theme") as "light" | "dark") : null) || "light",
  setTheme: (theme) => {
    if (typeof window !== "undefined") localStorage.setItem("bujo-theme", theme);
    set({ theme });
  },
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  shortcutHelpOpen: false,
  setShortcutHelpOpen: (open) => set({ shortcutHelpOpen: open }),
}));
