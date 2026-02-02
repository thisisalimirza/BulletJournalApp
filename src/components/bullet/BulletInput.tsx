"use client";

import { useState, useRef, useImperativeHandle, forwardRef, KeyboardEvent } from "react";
import { parseRapidInput } from "@/lib/bullets";
import { useBulletStore } from "@/lib/store/bulletStore";

interface BulletInputProps {
  parentId: string;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
  onFocusUp?: () => void;
}

const BulletInput = forwardRef<{ focus: () => void }, BulletInputProps>(
  ({ parentId, placeholder, onSubmit, autoFocus, onFocusUp }, ref) => {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const addBullet = useBulletStore((s) => s.addBullet);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Enter" && value.trim()) {
        e.preventDefault();
        const parsed = parseRapidInput(value.trim());
        await addBullet({
          type: parsed.type,
          signifiers: parsed.signifiers,
          text: parsed.text,
          parentId,
          indentLevel: 0,
        });
        setValue("");
        onSubmit?.();
      }
      if (e.key === "Escape") {
        setValue("");
        inputRef.current?.blur();
      }
      if (e.key === "ArrowUp" && !value) {
        e.preventDefault();
        inputRef.current?.blur();
        onFocusUp?.();
      }
    };

    // Detect prefix to show inline hint
    let hint = "";
    if (value.startsWith("- ")) hint = "note";
    else if (value.startsWith("o ") || value.startsWith("O ")) hint = "event";
    else if (value.startsWith("* ")) hint = "priority";
    else if (value.startsWith("! ")) hint = "inspiration";

    return (
      <div className="flex items-center gap-2 px-2 py-2 border-t border-border/50 mt-2">
        <span className="text-fg-faint text-sm font-mono">›</span>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type to add... (- note, o event, * priority)"}
            autoFocus={autoFocus}
            className="w-full bg-transparent text-sm font-mono text-fg placeholder:text-fg-faint/50 outline-none"
          />
          {hint && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-mono text-accent px-1.5 py-0.5 bg-accent-soft rounded">
              {hint}
            </span>
          )}
        </div>
      </div>
    );
  }
);

BulletInput.displayName = "BulletInput";
export default BulletInput;
