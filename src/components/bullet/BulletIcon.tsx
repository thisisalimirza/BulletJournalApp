"use client";

import { BulletType } from "@/lib/types";

interface BulletIconProps {
  type: BulletType;
  onClick?: () => void;
  size?: number;
}

export default function BulletIcon({ type, onClick, size = 14 }: BulletIconProps) {
  const className = `inline-flex items-center justify-center shrink-0 cursor-pointer select-none transition-transform hover:scale-110 active:scale-95`;

  const style = { width: size, height: size, fontSize: size };

  switch (type) {
    case BulletType.Task:
      return (
        <span className={className} onClick={onClick} style={style} title="Task">
          <svg width={size} height={size} viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="3.5" fill="var(--bullet-task)" />
          </svg>
        </span>
      );
    case BulletType.TaskComplete:
      return (
        <span className={className} onClick={onClick} style={style} title="Complete">
          <svg width={size} height={size} viewBox="0 0 14 14">
            <line x1="3" y1="3" x2="11" y2="11" stroke="var(--bullet-complete)" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="3" x2="3" y2="11" stroke="var(--bullet-complete)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      );
    case BulletType.TaskMigrated:
      return (
        <span className={className} onClick={onClick} style={style} title="Migrated">
          <svg width={size} height={size} viewBox="0 0 14 14">
            <path d="M4 3 L10 7 L4 11" fill="none" stroke="var(--fg-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case BulletType.TaskScheduled:
      return (
        <span className={className} onClick={onClick} style={style} title="Scheduled">
          <svg width={size} height={size} viewBox="0 0 14 14">
            <path d="M10 3 L4 7 L10 11" fill="none" stroke="var(--fg-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case BulletType.Event:
      return (
        <span className={className} onClick={onClick} style={style} title="Event">
          <svg width={size} height={size} viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="3.5" fill="none" stroke="var(--bullet-event)" strokeWidth="1.5" />
          </svg>
        </span>
      );
    case BulletType.Note:
      return (
        <span className={className} onClick={onClick} style={style} title="Note">
          <svg width={size} height={size} viewBox="0 0 14 14">
            <line x1="3" y1="7" x2="11" y2="7" stroke="var(--bullet-note)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      );
  }
}
