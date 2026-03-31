/**
 * Planner “today” uses the Gregorian civil date in Ethiopia so dashboard progress
 * matches Ethiopian calendar day (e.g. Megabit 20 → 29 Mar, not 28 Mar when local TZ lags).
 */
export const ETHIOPIA_PLANNER_TIMEZONE = "Africa/Addis_Ababa";

export type CivilYmd = { year: number; month: number; day: number };

export function getGregorianCivilDateInTimeZone(
  timeZone: string,
  instant: Date = new Date()
): CivilYmd {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(instant);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  return { year: y, month: m, day: d };
}

export function getEthiopiaTodayGregorian(instant: Date = new Date()): CivilYmd {
  return getGregorianCivilDateInTimeZone(
    ETHIOPIA_PLANNER_TIMEZONE,
    instant
  );
}

function civilToUtcOrdinal(y: number, month: number, day: number): number {
  return Date.UTC(y, month - 1, day);
}

export function compareCivilYmd(a: CivilYmd, b: CivilYmd): number {
  return civilToUtcOrdinal(a.year, a.month, a.day) -
    civilToUtcOrdinal(b.year, b.month, b.day);
}

/** e.g. "March 31, 2026" — civil Gregorian, locale-neutral via fixed UTC noon. */
export function formatCivilGregorianLong(
  ymd: CivilYmd,
  locale: string = "en-US"
): string {
  const d = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day, 12, 0, 0));
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
