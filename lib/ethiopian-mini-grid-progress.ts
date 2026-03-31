import { toEthiopian } from "ethiopian-calendar-new";
import type { EthiopianPlanCell } from "./ethiopian-2026";
import { daysInEthiopianMonth } from "./ethiopian-2026";
import { getEthiopiaTodayGregorian } from "./ethiopia-civil-date";

export type EthiopianMiniGridDayTone = "default" | "past" | "today";

export function getTodayEthiopian(): {
  year: number;
  month: number;
  day: number;
} {
  const g = getEthiopiaTodayGregorian();
  return toEthiopian(g.year, g.month, g.day);
}

export function compareEthiopianDates(
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number }
): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function getEthiopianMiniGridDayTone(
  ethYear: number,
  ethMonth: number,
  ethDay: number
): EthiopianMiniGridDayTone {
  const today = getTodayEthiopian();
  const cmp = compareEthiopianDates(
    { year: ethYear, month: ethMonth, day: ethDay },
    today
  );
  if (cmp < 0) return "past";
  if (cmp === 0) return "today";
  return "default";
}

export function isEthiopianDashboardMonthFullyPast(
  ethYear: number,
  ethMonth: number
): boolean {
  const last = daysInEthiopianMonth(ethYear, ethMonth);
  return getEthiopianMiniGridDayTone(ethYear, ethMonth, last) === "past";
}

export function isEthiopianDashboardMonthFullyFuture(
  ethYear: number,
  ethMonth: number
): boolean {
  return getEthiopianMiniGridDayTone(ethYear, ethMonth, 1) === "default";
}

export type EthiopianMiniGridProgressOptions = {
  /** Nehasé + Pagumē in one column: skip whole-month shortcuts; tone per cell by its ethMonth. */
  combinedNehasaePagume?: boolean;
};

/** Background classes for Ethiopian mini-grid cells when year-progress is on. */
export function getEthiopianMiniGridCellClasses(
  ethYear: number,
  ethMonth: number,
  cell: EthiopianPlanCell,
  yearProgress: boolean,
  options?: EthiopianMiniGridProgressOptions
): string {
  if (!yearProgress) return "";

  const combined = Boolean(options?.combinedNehasaePagume);

  if (!combined) {
    if (isEthiopianDashboardMonthFullyPast(ethYear, ethMonth)) {
      return "bg-[#d4d4d4] text-black";
    }
    if (isEthiopianDashboardMonthFullyFuture(ethYear, ethMonth)) {
      return "";
    }
  }

  if (cell.kind === "padding") {
    if (combined) {
      if (cell.placement === "trail") return "";
      return "bg-padding-day text-black";
    }
    const inProgress =
      !isEthiopianDashboardMonthFullyPast(ethYear, ethMonth) &&
      !isEthiopianDashboardMonthFullyFuture(ethYear, ethMonth);
    if (inProgress && cell.placement === "trail") return "";
    return "bg-padding-day text-black";
  }

  const tone = getEthiopianMiniGridDayTone(
    cell.ethYear,
    cell.ethMonth,
    cell.ethDay
  );
  if (tone === "past") return "bg-[#d4d4d4] text-black";
  if (tone === "today") return "bg-today-light-yellow text-black font-semibold";
  return "";
}
