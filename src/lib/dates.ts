const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayISO(): string {
  return localISO(new Date());
}

export function currentMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDailyDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()}.${d.getMonth() + 1}.${DAY_LETTERS[d.getDay()]}`;
}

export function formatDailyDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatMonthLabel(iso: string): string {
  const [y, m] = iso.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

export function formatMonthShort(iso: string): string {
  const m = parseInt(iso.split("-")[1]);
  return MONTH_SHORT[m - 1];
}

export function getDaysInMonth(monthISO: string): { day: number; letter: string; iso: string }[] {
  const [y, m] = monthISO.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  const days = [];
  for (let d = 1; d <= count; d++) {
    const date = new Date(y, m - 1, d);
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ day: d, letter: DAY_LETTERS[date.getDay()], iso });
  }
  return days;
}

export function getFutureLogMonths(): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function prevDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return localISO(d);
}

export function nextDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return localISO(d);
}

export function prevMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function nextMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function dailyScopeId(date: string): string {
  return `daily-${date}`;
}

export function monthlyScopeId(month: string): string {
  return `monthly-${month}`;
}
