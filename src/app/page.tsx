"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LOGS = [
  {
    symbol: "◦",
    name: "Daily Log",
    desc: "Your day, captured at the speed of thought. Every task, event, and note — no friction, no delay.",
  },
  {
    symbol: "▪",
    name: "Monthly Log",
    desc: "The bird's-eye view. A calendar of your month alongside the tasks that belong there.",
  },
  {
    symbol: "⟩",
    name: "Future Log",
    desc: "Six months at a glance. Schedule what's coming and migrate what couldn't happen yet.",
  },
  {
    symbol: "≡",
    name: "Collections",
    desc: "Custom spaces for anything: reading lists, habit grids, project trackers. Your notebook, your rules.",
  },
];

const STEPS = [
  { n: "1", text: "Open this page in Safari on your iPad or iPhone (not Chrome)." },
  { n: "2", text: 'Tap the Share button — the square with an arrow pointing up, in the Safari toolbar.' },
  { n: "3", text: 'Scroll down and tap "Add to Home Screen".' },
  { n: "4", text: 'Tap "Add" in the top-right corner.' },
  { n: "5", text: "Open BuJo from your home screen. Full screen. No browser bar. Your journal, as it should be." },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-bg text-fg overflow-x-hidden" style={{ minHeight: "100dvh" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-200"
        style={{
          background: scrolled ? "rgba(250,248,245,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        }}
      >
        <span className="font-mono text-sm font-semibold tracking-widest uppercase text-fg-muted">
          BuJo
        </span>
        <Link
          href="/launch"
          className="px-5 py-2 rounded-md text-sm font-mono text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Open Journal →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section
        className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 dotted-grid"
      >
        <p className="fade-up font-mono text-xs tracking-[0.22em] uppercase mb-6" style={{ color: "var(--accent)" }}>
          Digital Bullet Journal
        </p>

        <h1
          className="fade-up fade-up-delay-1 font-display leading-[1.08] text-fg mb-7"
          style={{ fontSize: "clamp(38px, 7.5vw, 84px)", letterSpacing: "-0.025em", maxWidth: "820px" }}
        >
          The ritual of the notebook.{" "}
          <span className="text-fg-muted">The reach of the digital.</span>
        </h1>

        <p className="fade-up fade-up-delay-2 text-lg text-fg-muted leading-relaxed mb-12" style={{ maxWidth: "520px" }}>
          Inspired by Ryder Carroll's Bullet Journal® Method — a system of rapid logging,
          intentional migration, and mindful tracking — rebuilt for the screen you carry everywhere.
        </p>

        <div className="fade-up fade-up-delay-3 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/launch"
            className="px-8 py-4 rounded-lg text-base font-mono text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Open the Journal →
          </Link>
          <a
            href="#method"
            className="text-sm font-mono text-fg-muted hover:text-fg transition-colors"
          >
            How it works ↓
          </a>
        </div>

        <p className="fade-up fade-up-delay-4 mt-16 text-xs font-mono text-fg-faint">
          Free · No account · All data stays on your device
        </p>
      </section>

      {/* ── The Method ── */}
      <section id="method" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-fg-faint mb-4">The System</p>
          <h2 className="font-display text-fg mb-5" style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.02em" }}>
            Built on the Bullet Journal® Method
          </h2>
          <p className="text-fg-muted leading-relaxed mx-auto" style={{ maxWidth: "560px" }}>
            Ryder Carroll developed the Bullet Journal® Method as a way to track the past,
            order the present, and plan the future — using nothing but a notebook and a pen.
            Every feature in this app maps directly to a page in that notebook.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LOGS.map((log) => (
            <div
              key={log.name}
              className="p-6 rounded-xl border"
              style={{ background: "var(--sidebar-bg)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start gap-4">
                <span
                  className="font-mono text-xl mt-0.5 shrink-0 w-7 text-center"
                  style={{ color: "var(--accent)" }}
                >
                  {log.symbol}
                </span>
                <div>
                  <h3 className="font-semibold text-fg mb-1.5">{log.name}</h3>
                  <p className="text-sm text-fg-muted leading-relaxed">{log.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section
        className="py-24 px-6 dotted-grid"
        style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-fg-faint mb-8">Philosophy</p>
          <blockquote
            className="font-display text-fg leading-snug mb-8"
            style={{ fontSize: "clamp(24px, 3.5vw, 40px)", letterSpacing: "-0.015em" }}
          >
            "Neither fully analog, nor fully digital —
            <br className="hidden md:block" />
            but the narrow channel between."
          </blockquote>
          <p className="text-fg-muted leading-relaxed mb-6" style={{ maxWidth: "560px", margin: "0 auto 24px" }}>
            Physical notebooks don't search. Apps don't feel like thinking.
            This is the space in between: the satisfaction and intention of pen on paper,
            with the practicality of something that lives in your pocket.
          </p>
          <p className="text-sm text-fg-faint font-mono">
            Inspired in part by{" "}
            <a
              href="https://mitpress.mit.edu/9780262544498/analog/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-fg-muted transition-colors"
            >
              Analog
            </a>{" "}
            — MIT Press — and Ryder Carroll's Bullet Journal® Method
          </p>
        </div>
      </section>

      {/* ── Rapid Logging ── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-fg-faint mb-4">Rapid Logging</p>
            <h2 className="font-display text-fg mb-5" style={{ fontSize: "clamp(24px, 3.5vw, 40px)", letterSpacing: "-0.02em" }}>
              Capture at the speed of thought
            </h2>
            <p className="text-fg-muted leading-relaxed mb-6">
              The core of the Bullet Journal® Method is rapid logging — a shorthand for
              capturing life as it happens. Just type. Prefix with{" "}
              <code className="font-mono text-sm px-1.5 py-0.5 rounded" style={{ background: "var(--accent-soft)" }}>-</code>{" "}
              for a note,{" "}
              <code className="font-mono text-sm px-1.5 py-0.5 rounded" style={{ background: "var(--accent-soft)" }}>o</code>{" "}
              for an event. Everything else is a task.
            </p>
            <p className="text-fg-muted leading-relaxed">
              Migration — the act of deciding what follows you forward — happens monthly,
              automatically prompted, exactly as Carroll intended.
            </p>
          </div>
          <div
            className="rounded-xl border p-5 font-mono text-sm"
            style={{ background: "var(--bg-page)", borderColor: "var(--border)" }}
          >
            <p className="text-fg-faint text-xs mb-4 tracking-wider">Daily Log · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
            <div className="space-y-2.5">
              {[
                { s: "•", t: "Review Q3 goals", c: "text-fg" },
                { s: "×", t: "Email Dr. Patel", c: "text-fg-faint line-through" },
                { s: "○", t: "Team standup 10am", c: "text-fg" },
                { s: "–", t: "Analog is not about nostalgia", c: "text-fg-muted" },
                { s: "•", t: "Read two chapters", c: "text-fg" },
                { s: "*", t: "Ship landing page", c: "text-fg", accent: true },
              ].map((row, i) => (
                <div key={i} className="flex items-baseline gap-3">
                  <span
                    className="w-4 text-center shrink-0"
                    style={{ color: row.accent ? "var(--accent)" : "var(--fg-faint)" }}
                  >
                    {row.s}
                  </span>
                  <span className={row.c}>{row.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy ── */}
      <section
        className="py-20 px-6"
        style={{ background: "var(--sidebar-bg)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-fg-faint mb-4">Privacy</p>
          <h2 className="font-display text-fg mb-5" style={{ fontSize: "clamp(24px, 3.5vw, 40px)", letterSpacing: "-0.02em" }}>
            Your journal stays yours
          </h2>
          <p className="text-fg-muted leading-relaxed mx-auto mb-10" style={{ maxWidth: "520px" }}>
            No account. No server. No sync. Everything is stored in your browser's local storage —
            it never leaves your device. Delete the app and it's gone. That's the whole deal.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-mono text-fg-muted">
            {["No login required", "No cloud storage", "No ads", "No tracking", "Fully offline"].map((t) => (
              <span
                key={t}
                className="px-4 py-2 rounded-full border"
                style={{ borderColor: "var(--border)", background: "var(--bg)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Install Guide ── */}
      <section id="install" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-widest uppercase text-fg-faint mb-4">Best on iPad & iPhone</p>
          <h2 className="font-display text-fg mb-5" style={{ fontSize: "clamp(24px, 3.5vw, 40px)", letterSpacing: "-0.02em" }}>
            Add it to your home screen
          </h2>
          <p className="text-fg-muted leading-relaxed">
            BuJo works best as a home screen app — full screen, instant load, no browser bar.
            Here's how to set it up in 30 seconds.
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="flex gap-5 p-5 rounded-xl border items-start"
              style={{ background: "var(--sidebar-bg)", borderColor: "var(--border)" }}
            >
              <span
                className="font-mono text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white"
                style={{ background: "var(--accent)" }}
              >
                {step.n}
              </span>
              <p className="text-fg-muted leading-relaxed pt-0.5">{step.text}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-8 p-4 rounded-lg flex items-start gap-3 text-sm"
          style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)" }}
        >
          <span style={{ color: "var(--accent)" }}>ℹ</span>
          <p className="text-fg-muted">
            This only works in <strong>Safari</strong>. If you're using Chrome or another browser,
            copy the URL and paste it into Safari first.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-24 px-6 text-center dotted-grid"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="font-mono text-xs tracking-widest uppercase text-fg-faint mb-6">Ready?</p>
        <h2 className="font-display text-fg mb-8" style={{ fontSize: "clamp(28px, 4vw, 52px)", letterSpacing: "-0.02em", maxWidth: "600px", margin: "0 auto 32px" }}>
          Your journal is waiting.
        </h2>
        <Link
          href="/launch"
          className="inline-block px-10 py-4 rounded-lg text-base font-mono text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Open the Journal →
        </Link>
        <p className="mt-6 text-xs font-mono text-fg-faint">
          Free · Works offline · Your data, your device
        </p>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-8 px-6 text-center"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="text-xs font-mono text-fg-faint">
          BuJo is an independent app inspired by the{" "}
          <a href="https://bulletjournal.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg-muted transition-colors">
            Bullet Journal® Method
          </a>{" "}
          by Ryder Carroll and the analog movement. Not affiliated with Bullet Journal LLC.
        </p>
      </footer>

    </div>
  );
}
