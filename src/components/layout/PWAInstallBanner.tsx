"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bujo-pwa-banner-dismissed";

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari when not already running as a standalone PWA
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      (window.navigator as { standalone?: boolean }).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";

    if (isIOS && !isStandalone && !dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md md:rounded-xl md:shadow-lg"
      style={{
        background: "var(--bg-page)",
        border: "1px solid var(--border)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
      }}
    >
      <div className="px-5 pt-4 pb-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-semibold text-fg text-sm">Get the full app experience</p>
          <button
            onClick={dismiss}
            className="text-fg-faint hover:text-fg transition-colors shrink-0 -mt-0.5"
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-fg-muted leading-relaxed mb-4">
          Add BuJo to your home screen for a full-screen app — no browser bar, loads
          instantly, all your data stays private on this device.
        </p>
        <div className="space-y-2 mb-4">
          {[
            "Tap the Share button  \u{1F4E4}  in the Safari toolbar",
            'Tap "Add to Home Screen"',
            "Tap Add — done!",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-fg-muted">
              <span
                className="font-mono font-bold text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 text-[10px]"
                style={{ background: "var(--accent)" }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <button
          onClick={dismiss}
          className="w-full text-center text-xs font-mono text-fg-faint py-2 hover:text-fg transition-colors border-t"
          style={{ borderColor: "var(--border)" }}
        >
          I&apos;ll do it later
        </button>
      </div>
    </div>
  );
}
