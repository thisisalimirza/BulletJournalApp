"use client";

import PageShell from "@/components/layout/PageShell";
import IndexView from "@/components/modules/IndexView";
export default function IndexPage() {
  return (
    <PageShell title="Index" subtitle="Your table of contents — all pages auto-populate here">
      <IndexView />
    </PageShell>
  );
}
