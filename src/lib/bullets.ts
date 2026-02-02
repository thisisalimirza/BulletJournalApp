import { BulletType, Signifier } from "./types";

export interface ParsedInput {
  type: BulletType;
  signifiers: Signifier[];
  text: string;
}

export function parseRapidInput(raw: string): ParsedInput {
  let remaining = raw;
  const signifiers: Signifier[] = [];

  if (remaining.startsWith("* ")) {
    signifiers.push(Signifier.Priority);
    remaining = remaining.slice(2);
  } else if (remaining.startsWith("! ")) {
    signifiers.push(Signifier.Inspiration);
    remaining = remaining.slice(2);
  }

  if (remaining.startsWith("- ")) {
    return { type: BulletType.Note, signifiers, text: remaining.slice(2) };
  }
  if (remaining.startsWith("o ") || remaining.startsWith("O ")) {
    return { type: BulletType.Event, signifiers, text: remaining.slice(2) };
  }

  return { type: BulletType.Task, signifiers, text: remaining };
}

export function bulletPrefix(type: BulletType): string {
  switch (type) {
    case BulletType.Task: return "•";
    case BulletType.TaskComplete: return "×";
    case BulletType.TaskMigrated: return "›";
    case BulletType.TaskScheduled: return "‹";
    case BulletType.Event: return "○";
    case BulletType.Note: return "–";
  }
}
