import DailyPageClient from "./DailyPageClient";

export async function generateStaticParams() {
  const today = new Date();
  const params = [];
  for (let i = -90; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    params.push({ date: d.toISOString().slice(0, 10) });
  }
  return params;
}

export default async function DailyPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <DailyPageClient date={date} />;
}
