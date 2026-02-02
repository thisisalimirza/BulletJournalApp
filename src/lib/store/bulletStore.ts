import { create } from "zustand";
import { nanoid } from "nanoid";
import { db } from "../db/schema";
import { BulletType, type Bullet, type PageScope, type ThreadLink } from "../types";
import { useUndoStore } from "./undoStore";

interface BulletStore {
  bullets: Record<string, Bullet>;
  scopes: Record<string, PageScope>;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  addBullet: (partial: Pick<Bullet, "type" | "signifiers" | "text" | "parentId" | "indentLevel">) => Promise<Bullet>;
  updateBullet: (id: string, updates: Partial<Bullet>) => Promise<void>;
  deleteBullet: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  migrateBullet: (id: string, targetParentId: string) => Promise<void>;
  scheduleBullet: (id: string, targetParentId: string) => Promise<void>;
  ensureScope: (scope: Omit<PageScope, "createdAt" | "sortOrder">) => Promise<void>;
  updateScope: (id: string, updates: Partial<PageScope>) => Promise<void>;
  deleteScope: (id: string) => Promise<void>;
  addThreadLink: (bulletId: string, link: ThreadLink) => Promise<void>;
  toggleHabitCheck: (bulletId: string, dateISO: string) => Promise<void>;
  reorderBullet: (bulletId: string, direction: "up" | "down") => Promise<void>;
  getBulletsByParent: (parentId: string) => Bullet[];
}

export const useBulletStore = create<BulletStore>((set, get) => ({
  bullets: {},
  scopes: {},
  hydrated: false,

  hydrate: async () => {
    const [allBullets, allScopes] = await Promise.all([
      db.bullets.toArray(),
      db.scopes.toArray(),
    ]);
    const bullets: Record<string, Bullet> = {};
    allBullets.forEach((b) => (bullets[b.id] = b));
    const scopes: Record<string, PageScope> = {};
    allScopes.forEach((s) => (scopes[s.id] = s));
    set({ bullets, scopes, hydrated: true });
  },

  addBullet: async (partial) => {
    const siblings = get().getBulletsByParent(partial.parentId);
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map((b) => b.sortOrder)) : 0;
    const bullet: Bullet = {
      id: nanoid(),
      type: partial.type,
      signifiers: partial.signifiers,
      text: partial.text,
      parentId: partial.parentId,
      sortOrder: maxOrder + 1,
      indentLevel: partial.indentLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      threadLinks: [],
    };
    await db.bullets.add(bullet);
    set((s) => ({ bullets: { ...s.bullets, [bullet.id]: bullet } }));
    return bullet;
  },

  updateBullet: async (id, updates) => {
    const existing = get().bullets[id];
    if (!existing) return;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await db.bullets.put(updated);
    set((s) => ({ bullets: { ...s.bullets, [id]: updated } }));
  },

  deleteBullet: async (id) => {
    const deleted = get().bullets[id];
    await db.bullets.delete(id);
    set((s) => {
      const { [id]: _, ...rest } = s.bullets;
      return { bullets: rest };
    });
    if (deleted) {
      useUndoStore.getState().pushUndo({
        id: nanoid(),
        label: `Deleted "${deleted.text.slice(0, 30)}"`,
        undo: async () => {
          await db.bullets.add(deleted);
          set((s) => ({ bullets: { ...s.bullets, [deleted.id]: deleted } }));
        },
      });
    }
  },

  toggleComplete: async (id) => {
    const bullet = get().bullets[id];
    if (!bullet) return;
    const newType = bullet.type === BulletType.TaskComplete ? BulletType.Task : BulletType.TaskComplete;
    await get().updateBullet(id, { type: newType });
  },

  migrateBullet: async (id, targetParentId) => {
    const bullet = get().bullets[id];
    if (!bullet) return;
    const newBullet = await get().addBullet({
      type: BulletType.Task,
      signifiers: bullet.signifiers,
      text: bullet.text,
      parentId: targetParentId,
      indentLevel: 0,
    });
    await get().updateBullet(id, {
      type: BulletType.TaskMigrated,
      migratedTo: newBullet.id,
    });
  },

  scheduleBullet: async (id, targetParentId) => {
    const bullet = get().bullets[id];
    if (!bullet) return;
    const newBullet = await get().addBullet({
      type: BulletType.Task,
      signifiers: bullet.signifiers,
      text: bullet.text,
      parentId: targetParentId,
      indentLevel: 0,
    });
    await get().updateBullet(id, {
      type: BulletType.TaskScheduled,
      migratedTo: newBullet.id,
    });
  },

  ensureScope: async (scope) => {
    if (get().scopes[scope.id]) return;
    const allScopes = Object.values(get().scopes);
    const maxOrder = allScopes.length > 0 ? Math.max(...allScopes.map((s) => s.sortOrder)) : 0;
    const full: PageScope = {
      ...scope,
      createdAt: new Date().toISOString(),
      sortOrder: maxOrder + 1,
    };
    await db.scopes.put(full);
    set((s) => ({ scopes: { ...s.scopes, [full.id]: full } }));
  },

  updateScope: async (id, updates) => {
    const existing = get().scopes[id];
    if (!existing) return;
    const updated = { ...existing, ...updates };
    await db.scopes.put(updated);
    set((s) => ({ scopes: { ...s.scopes, [id]: updated } }));
  },

  deleteScope: async (id) => {
    // Delete all bullets belonging to this scope
    const childBullets = Object.values(get().bullets).filter((b) => b.parentId === id);
    await db.bullets.bulkDelete(childBullets.map((b) => b.id));
    await db.scopes.delete(id);
    set((s) => {
      const { [id]: _, ...restScopes } = s.scopes;
      const bullets = { ...s.bullets };
      childBullets.forEach((b) => delete bullets[b.id]);
      return { scopes: restScopes, bullets };
    });
  },

  addThreadLink: async (bulletId, link) => {
    const bullet = get().bullets[bulletId];
    if (!bullet) return;
    const threadLinks = [...bullet.threadLinks, link];
    await get().updateBullet(bulletId, { threadLinks });
  },

  toggleHabitCheck: async (bulletId, dateISO) => {
    const bullet = get().bullets[bulletId];
    if (!bullet) return;
    const checks = { ...(bullet.habitChecks || {}) };
    checks[dateISO] = !checks[dateISO];
    await get().updateBullet(bulletId, { habitChecks: checks });
  },

  reorderBullet: async (bulletId, direction) => {
    const bullet = get().bullets[bulletId];
    if (!bullet) return;
    const siblings = get().getBulletsByParent(bullet.parentId);
    const idx = siblings.findIndex((b) => b.id === bulletId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const other = siblings[swapIdx];
    // Swap sortOrder values
    const tempOrder = bullet.sortOrder;
    await get().updateBullet(bulletId, { sortOrder: other.sortOrder });
    await get().updateBullet(other.id, { sortOrder: tempOrder });
  },

  getBulletsByParent: (parentId) => {
    return Object.values(get().bullets)
      .filter((b) => b.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
}));
