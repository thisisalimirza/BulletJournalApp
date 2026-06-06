import MonthlyPageClient from "./MonthlyPageClient";

export async function generateStaticParams() {
  const today = new Date();
  const params = [];
  for (let i = -12; i <= 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    params.push({ month: `${year}-${month}` });
  }
  return params;
}

export default async function MonthlyPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  return <MonthlyPageClient month={month} />;
}
