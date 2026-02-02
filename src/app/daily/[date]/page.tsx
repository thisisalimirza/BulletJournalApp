"use client";

import { use } from "react";
import PageShell from "@/components/layout/PageShell";
import DailyLogView from "@/components/modules/DailyLogView";
import { formatDailyDateLong } from "@/lib/dates";

export default function DailyPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);

  return (
    <PageShell title="Daily Log" subtitle={`${formatDailyDateLong(date)} — rapid log your day`}>
      <DailyLogView date={date} />
    </PageShell>
  );
}
