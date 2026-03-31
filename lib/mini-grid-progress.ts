import type { MonthKey } from "./calendar-2026";
import { getDaysInGregorianMonth } from "./calendar-2026";
import type { CalendarCell } from "./build-month-weeks";
import { monthKeyToIndex } from "./build-month-weeks";
import {
  compareCivilYmd,
  getEthiopiaTodayGregorian,
} from "./ethiopia-civil-date";

export type MiniGridDayTone = "default" | "past" | "today";

/** Compare planner cell to today’s Gregorian civil date in Ethiopia (Addis Ababa). */
export function getMiniGridDayTone(
  monthKey: MonthKey,
  day: number,
  plannerYear: number
): MiniGridDayTone {
  const today = getEthiopiaTodayGregorian();
  const cell: { year: number; month: number; day: number } = {
    year: plannerYear,
    month: monthKeyToIndex(monthKey) + 1,
    day,
  };
  const cmp = compareCivilYmd(cell, today);
  if (cmp < 0) return "past";
  if (cmp === 0) return "today";
  return "default";
}

/** Last day of month is before today (entire month in the past). */
export function isDashboardMonthFullyPast(
  monthKey: MonthKey,
  plannerYear: number
): boolean {
  const last = getDaysInGregorianMonth(monthKey, plannerYear);
  return getMiniGridDayTone(monthKey, last, plannerYear) === "past";
}

/** First day of month is after today (month not started yet). */
export function isDashboardMonthFullyFuture(
  monthKey: MonthKey,
  plannerYear: number
): boolean {
  return getMiniGridDayTone(monthKey, 1, plannerYear) === "default";
}

/** Background classes for a mini-grid cell when year-progress mode is on. */
export function getMiniGridCellClasses(
  monthKey: MonthKey,
  cell: CalendarCell,
  yearProgress: boolean,
  plannerYear: number
): string {
  if (!yearProgress) return "";

  if (isDashboardMonthFullyPast(monthKey, plannerYear)) {
    return "bg-neutral-300 text-foreground dark:bg-slate-600";
  }
  if (isDashboardMonthFullyFuture(monthKey, plannerYear)) {
    return "";
  }

  if (cell.kind === "padding") {
    const inProgress =
      !isDashboardMonthFullyPast(monthKey, plannerYear) &&
      !isDashboardMonthFullyFuture(monthKey, plannerYear);
    if (inProgress && cell.placement === "trail") return "";
    return "bg-padding-day text-foreground";
  }

  const tone = getMiniGridDayTone(monthKey, cell.day, plannerYear);
  if (tone === "past") return "bg-neutral-300 text-foreground dark:bg-slate-600";
  if (tone === "today")
    return "bg-today-light-yellow text-foreground font-semibold";
  return "";
}
