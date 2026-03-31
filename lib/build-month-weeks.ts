import type { MonthKey } from "./calendar-2026";
import { getDaysInGregorianMonth } from "./calendar-2026";

/** 0 = Monday … 6 = Sunday */
export function weekdayMondayFirst(year: number, monthIndex: number): number {
  const d = new Date(year, monthIndex, 1).getDay();
  return (d + 6) % 7;
}

export type CalendarCell =
  | { kind: "padding"; placement: "lead" | "trail" }
  | { kind: "day"; day: number };

/** Build rows of 7 cells, Monday-first week, for a month in the given Gregorian year. */
export function buildMonthWeeks(
  monthKey: MonthKey,
  gregorianYear: number
): CalendarCell[][] {
  const monthIndex = monthKeyToIndex(monthKey);
  const daysInMonth = getDaysInGregorianMonth(monthKey, gregorianYear);
  const lead = weekdayMondayFirst(gregorianYear, monthIndex);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < lead; i++) cells.push({ kind: "padding", placement: "lead" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ kind: "day", day: d });

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    cells.push({ kind: "padding", placement: "trail" });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function monthKeyToIndex(key: MonthKey): number {
  const map: Record<MonthKey, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  return map[key];
}
