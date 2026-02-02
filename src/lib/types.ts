export enum BulletType {
  Task = "task",
  TaskComplete = "task_complete",
  TaskMigrated = "task_migrated",
  TaskScheduled = "task_scheduled",
  Event = "event",
  Note = "note",
}

export enum Signifier {
  Priority = "priority",
  Inspiration = "inspiration",
}

export interface ThreadLink {
  targetBulletId: string;
  targetParentId: string;
  label?: string;
}

export interface Bullet {
  id: string;
  type: BulletType;
  signifiers: Signifier[];
  text: string;
  createdAt: string;
  updatedAt: string;
  parentId: string;
  sortOrder: number;
  indentLevel: number;
  threadLinks: ThreadLink[];
  migratedFrom?: string;
  migratedTo?: string;
  habitChecks?: Record<string, boolean>;
}

export type ScopeType = "daily" | "monthly" | "future" | "collection";

export type CollectionSubType = "list" | "habit-tracker";

export interface PageScope {
  id: string;
  type: ScopeType;
  label: string;
  date?: string;
  createdAt: string;
  sortOrder: number;
  collectionSubType?: CollectionSubType;
  dayNotes?: Record<string, string>;
}

export interface Collection {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
  sortOrder: number;
}

export interface IndexEntry {
  id: string;
  scopeId: string;
  label: string;
  pageNumber: number;
}

export interface AppSettings {
  id?: number;
  theme: "light" | "dark" | "system";
  showDottedGrid: boolean;
}
