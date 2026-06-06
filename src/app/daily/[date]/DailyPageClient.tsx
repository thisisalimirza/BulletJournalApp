"use client";

import PageShell from "@/components/layout/PageShell";
import DailyLogView from "@/components/modules/DailyLogView";
import { formatDailyDateLong } from "@/lib/dates";

export default function DailyPageClient({ date }: { date: string }) {
  return (
    <PageShell title="Daily Log" subtitle={`${formatDailyDateLong(date)} — rapid log your day`}>
      <DailyLogView date={date} />
    </PageShell>
  );
}
