import {
  isEthiopianLeapYear,
  toEthiopian,
  toGregorian,
} from "ethiopian-calendar-new";
import type { MonthKey } from "./calendar-2026";
import { MONTH_ORDER } from "./calendar-2026";
import { getEthiopiaTodayGregorian } from "./ethiopia-civil-date";

/** One Ethiopian month that has at least one day in the given Gregorian year. */
export type EthiopianMonthSlot = {
  ethYear: number;
  ethMonth: number;
  shortLabel: string;
  fullLabel: string;
};

const ETH_MONTH_NAMES: Record<number, { short: string; full: string }> = {
  1: { short: "MES", full: "Meskerem" },
  2: { short: "TIK", full: "Tikimt" },
  3: { short: "HID", full: "Hidar" },
  4: { short: "TAH", full: "Tahsas" },
  5: { short: "TIR", full: "Tir" },
  6: { short: "YEK", full: "Yekatit" },
  7: { short: "MEG", full: "Megabit" },
  8: { short: "MIA", full: "Miazia" },
  9: { short: "GIN", full: "Ginbot" },
  10: { short: "SEN", full: "Sene" },
  11: { short: "HAM", full: "Hamle" },
  12: { short: "NEH", full: "Nehasé" },
  13: { short: "PAG", full: "Pagumē" },
};

function daysInGregorianMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

/**
 * Ethiopian calendar year (E.C.) to pair with a Gregorian planner year for the dashboard
 * and month tabs: the E.C. year that contains Gregorian July 1 (mid-year anchor), so the
 * chosen E.C. year matches where most of that Gregorian year falls.
 */
export function getEthiopianYearForGregorianPlannerYear(
  gregorianYear: number
): number {
  return toEthiopian(gregorianYear, 7, 1).year;
}

/** All 13 Ethiopian months for one E.C. year, Meskerem (1) through Pagumē (13). */
export function getEthiopianMonthsForEthiopianYear(
  ethYear: number
): EthiopianMonthSlot[] {
  const out: EthiopianMonthSlot[] = [];
  for (let m = 1; m <= 13; m++) {
    const names = ETH_MONTH_NAMES[m] ?? {
      short: `M${m}`,
      full: `Month ${m}`,
    };
    out.push({
      ethYear,
      ethMonth: m,
      shortLabel: names.short,
      fullLabel: `${names.full} ${ethYear}`,
    });
  }
  return out;
}

/** Dashboard / Ethiopian tab strip: one full E.C. year aligned to the planner, not GC overlap. */
export function getEthiopianMonthsForPlannerDisplay(
  gregorianYear: number
): EthiopianMonthSlot[] {
  const y = getEthiopianYearForGregorianPlannerYear(gregorianYear);
  return getEthiopianMonthsForEthiopianYear(y);
}

/** Every Ethiopian month that has at least one day in the given Gregorian year (overlap set). */
export function getEthiopianMonthsInGregorianYear(
  gregorianYear: number
): EthiopianMonthSlot[] {
  const seen = new Set<string>();
  const out: EthiopianMonthSlot[] = [];
  for (let m = 1; m <= 12; m++) {
    const dim = daysInGregorianMonth(gregorianYear, m);
    for (let d = 1; d <= dim; d++) {
      const e = toEthiopian(gregorianYear, m, d);
      const key = `${e.year}:${e.month}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const names = ETH_MONTH_NAMES[e.month] ?? {
        short: `M${e.month}`,
        full: `Month ${e.month}`,
      };
      out.push({
        ethYear: e.year,
        ethMonth: e.month,
        shortLabel: names.short,
        fullLabel: `${names.full} ${e.year}`,
      });
    }
  }
  return out;
}

function ethiopianMonthTouchesGregorianYear(
  ethYear: number,
  ethMonth: number,
  gregorianYear: number
): boolean {
  const n = daysInEthiopianMonth(ethYear, ethMonth);
  for (let ed = 1; ed <= n; ed++) {
    const g = toGregorian(ethYear, ethMonth, ed);
    if (g.year === gregorianYear) return true;
  }
  return false;
}

/** Label for the Ethiopian year shown on the dashboard for this Gregorian planner year. */
export function formatEthiopianYearRangeLabel(gregorianYear: number): string {
  const y = getEthiopianYearForGregorianPlannerYear(gregorianYear);
  return `${y} E.C.`;
}

export function formatEthiopianDateLine(e: {
  year: number;
  month: number;
  day: number;
}): string {
  const names = ETH_MONTH_NAMES[e.month];
  const mn = names?.full ?? `Month ${e.month}`;
  return `${mn} ${e.day}, ${e.year} E.C.`;
}

export function ethiopianSlotKey(ethYear: number, ethMonth: number): string {
  return `${ethYear}:${ethMonth}`;
}

export function findEthiopianSlot(
  ethYear: number,
  ethMonth: number,
  gregorianYear: number
): EthiopianMonthSlot | undefined {
  if (!ethiopianMonthTouchesGregorianYear(ethYear, ethMonth, gregorianYear)) {
    return undefined;
  }
  const names = ETH_MONTH_NAMES[ethMonth] ?? {
    short: `M${ethMonth}`,
    full: `Month ${ethMonth}`,
  };
  return {
    ethYear,
    ethMonth,
    shortLabel: names.short,
    fullLabel: `${names.full} ${ethYear}`,
  };
}

export function daysInEthiopianMonth(
  ethYear: number,
  ethMonth: number
): number {
  if (ethMonth === 13) return isEthiopianLeapYear(ethYear) ? 6 : 5;
  return 30;
}

function weekdayMondayFirstFromGregorian(
  gYear: number,
  gMonth1: number,
  gDay: number
): number {
  const dow = new Date(gYear, gMonth1 - 1, gDay).getDay();
  return (dow + 6) % 7;
}

export type EthiopianPlanCell =
  | { kind: "padding"; placement: "lead" | "trail" }
  | {
      kind: "day";
      ethYear: number;
      ethMonth: number;
      ethDay: number;
      gregorian:
        | { monthKey: MonthKey; day: number }
        | null;
    };

/** Monday-first week grid; cells map to planner Gregorian keys when they fall in `plannerGregorianYear`. */
export function buildEthiopianMonthWeeks(
  ethYear: number,
  ethMonth: number,
  plannerGregorianYear: number
): EthiopianPlanCell[][] {
  const n = daysInEthiopianMonth(ethYear, ethMonth);
  const g1 = toGregorian(ethYear, ethMonth, 1);
  const lead = weekdayMondayFirstFromGregorian(
    g1.year,
    g1.month,
    g1.day
  );
  const cells: EthiopianPlanCell[] = [];
  for (let i = 0; i < lead; i++) {
    cells.push({ kind: "padding", placement: "lead" });
  }
  for (let ed = 1; ed <= n; ed++) {
    const g = toGregorian(ethYear, ethMonth, ed);
    const gregorian =
      g.year === plannerGregorianYear
        ? {
            monthKey: MONTH_ORDER[g.month - 1] as MonthKey,
            day: g.day,
          }
        : null;
    cells.push({
      kind: "day",
      ethYear,
      ethMonth,
      ethDay: ed,
      gregorian,
    });
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    cells.push({ kind: "padding", placement: "trail" });
  }
  const weeks: EthiopianPlanCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/**
 * One continuous mini-grid: Nehasé 1–30 then Pagumē 1–5/6 (correct Ethiopian day numbers, not two “month 31” columns).
 */
export function buildNehasaePagumeWeeks(
  ethYear: number,
  plannerGregorianYear: number
): EthiopianPlanCell[][] {
  const cells: EthiopianPlanCell[] = [];
  const g1 = toGregorian(ethYear, 12, 1);
  const lead = weekdayMondayFirstFromGregorian(
    g1.year,
    g1.month,
    g1.day
  );
  for (let i = 0; i < lead; i++) {
    cells.push({ kind: "padding", placement: "lead" });
  }
  for (let ed = 1; ed <= 30; ed++) {
    const g = toGregorian(ethYear, 12, ed);
    const gregorian =
      g.year === plannerGregorianYear
        ? {
            monthKey: MONTH_ORDER[g.month - 1] as MonthKey,
            day: g.day,
          }
        : null;
    cells.push({
      kind: "day",
      ethYear,
      ethMonth: 12,
      ethDay: ed,
      gregorian,
    });
  }
  const pagDays = daysInEthiopianMonth(ethYear, 13);
  for (let ed = 1; ed <= pagDays; ed++) {
    const g = toGregorian(ethYear, 13, ed);
    const gregorian =
      g.year === plannerGregorianYear
        ? {
            monthKey: MONTH_ORDER[g.month - 1] as MonthKey,
            day: g.day,
          }
        : null;
    cells.push({
      kind: "day",
      ethYear,
      ethMonth: 13,
      ethDay: ed,
      gregorian,
    });
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    cells.push({ kind: "padding", placement: "trail" });
  }
  const weeks: EthiopianPlanCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function primaryGregorianMonthForEthiopianMonth(
  ethYear: number,
  ethMonth: number,
  plannerGregorianYear: number
): MonthKey {
  const counts: Partial<Record<MonthKey, number>> = {};
  const n = daysInEthiopianMonth(ethYear, ethMonth);
  for (let ed = 1; ed <= n; ed++) {
    const g = toGregorian(ethYear, ethMonth, ed);
    if (g.year !== plannerGregorianYear) continue;
    const mk = MONTH_ORDER[g.month - 1] as MonthKey;
    counts[mk] = (counts[mk] ?? 0) + 1;
  }
  let best: MonthKey = "jan";
  let bestc = -1;
  for (const mk of MONTH_ORDER) {
    const c = counts[mk] ?? 0;
    if (c > bestc) {
      bestc = c;
      best = mk;
    }
  }
  return best;
}

/** “Live” Ethiopian month for neutral padding uses Ethiopia’s civil Gregorian date. */
export function isEthiopianMonthWallClock(
  ethYear: number,
  ethMonth: number
): boolean {
  const g = getEthiopiaTodayGregorian();
  const e = toEthiopian(g.year, g.month, g.day);
  return e.year === ethYear && e.month === ethMonth;
}

export function toEthiopianFromPlannerMonthDay(
  monthKey: MonthKey,
  day: number,
  plannerGregorianYear: number
): { year: number; month: number; day: number } {
  const m = MONTH_ORDER.indexOf(monthKey) + 1;
  return toEthiopian(plannerGregorianYear, m, day);
}

export function defaultGregorianMonthForEthiopianTab(
  ethYear: number,
  ethMonth: number,
  plannerGregorianYear: number
): MonthKey {
  for (let ed = 1; ed <= daysInEthiopianMonth(ethYear, ethMonth); ed++) {
    const g = toGregorian(ethYear, ethMonth, ed);
    if (g.year === plannerGregorianYear) {
      return MONTH_ORDER[g.month - 1] as MonthKey;
    }
  }
  return "jan";
}
