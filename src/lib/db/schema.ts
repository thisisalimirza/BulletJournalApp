import Dexie, { type EntityTable } from "dexie";
import type { Bullet, PageScope, Collection, IndexEntry, AppSettings } from "../types";

const db = new Dexie("BulletJournalDB") as Dexie & {
  bullets: EntityTable<Bullet, "id">;
  scopes: EntityTable<PageScope, "id">;
  collections: EntityTable<Collection, "id">;
  indexEntries: EntityTable<IndexEntry, "id">;
  settings: EntityTable<AppSettings, "id">;
};

db.version(1).stores({
  bullets: "id, parentId, type, createdAt, sortOrder, [parentId+sortOrder]",
  scopes: "id, type, date, sortOrder",
  collections: "id, sortOrder",
  indexEntries: "id, scopeId, pageNumber",
  settings: "++id",
});

export { db };
