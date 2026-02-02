"use client";

import PageShell from "@/components/layout/PageShell";
import FutureLogView from "@/components/modules/FutureLogView";

export default function FutureLogPage() {
  return (
    <PageShell title="Future Log" subtitle="Plan ahead — add tasks to upcoming months, or press < on any task to schedule it here">
      <FutureLogView />
    </PageShell>
  );
}
