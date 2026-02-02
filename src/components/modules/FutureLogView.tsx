"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBulletStore } from "@/lib/store/bulletStore";
import { getFutureLogMonths, formatMonthShort, monthlyScopeId, formatMonthLabel } from "@/lib/dates";
import BulletList from "@/components/bullet/BulletList";

export default function FutureLogView() {
  const ensureScope = useBulletStore((s) => s.ensureScope);
  const months = getFutureLogMonths();
  const router = useRouter();
  const [focusIndex, setFocusIndex] = useState(-1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    months.forEach((m) => {
      ensureScope({
        id: `future-${m}`,
        type: "future",
        label: formatMonthLabel(m),
        date: m,
      });
    });
  }, []);

  useEffect(() => {
    if (focusIndex >= 0 && cardRefs.current[focusIndex]) {
      cardRefs.current[focusIndex]!.scrollIntoView({ block: "nearest" });
    }
  }, [focusIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          // Move down by 2 (grid is 2 cols)
          setFocusIndex((i) => (i < 0 ? 0 : Math.min(i + 2, months.length - 1)));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - 2, 0));
          break;
        case "l":
        case "ArrowRight":
          e.preventDefault();
          setFocusIndex((i) => (i < 0 ? 0 : Math.min(i + 1, months.length - 1)));
          break;
        case "h":
        case "ArrowLeft":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          if (focusIndex >= 0 && focusIndex < months.length) {
            e.preventDefault();
            router.push(`/monthly/${months[focusIndex]}`);
          }
          break;
        case "Escape":
          e.preventDefault();
          setFocusIndex(-1);
          break;
      }
    },
    [months, focusIndex, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="grid grid-cols-2 gap-6">
      {months.map((m, i) => {
        const focused = i === focusIndex;
        return (
          <div
            key={m}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`border rounded-lg p-4 bg-bg-page/50 transition-all ${
              focused ? "border-accent ring-1 ring-accent/30" : "border-border"
            }`}
          >
            <Link
              href={`/monthly/${m}`}
              className="font-mono text-sm font-semibold text-fg hover:text-accent transition-colors underline-offset-2 hover:underline"
            >
              {formatMonthLabel(m)}
            </Link>
            <div className="mt-3">
              <BulletList parentId={`future-${m}`} showInput compact />
            </div>
          </div>
        );
      })}
    </div>
  );
}
