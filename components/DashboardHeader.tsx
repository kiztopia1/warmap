import type { CalendarTabMode } from "@/lib/calendar-2026";

type Props = {
  /** Which dashboard calendar layout is active — that civil date reads larger. */
  calendarTabMode: CalendarTabMode;
  /** Ethiopian civil date (e.g. Megabit 22, 2018 E.C.). */
  ethiopianDateLine: string;
  /** Gregorian civil date in Ethiopia, long form (e.g. March 31, 2026). */
  gregorianDateLine: string;
  /** Gregorian year used for planner grids. */
  gregorianPlannerYear: number;
};

const primaryTitle =
  "text-xl font-bold tracking-tight text-title-blue md:text-2xl";
const secondaryLine =
  "mt-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400";

export function DashboardHeader({
  calendarTabMode,
  ethiopianDateLine,
  gregorianDateLine,
  gregorianPlannerYear,
}: Props) {
  const gregorianPrimary = calendarTabMode === "gregorian";

  return (
    <header className="shrink-0">
      <div className="h-1.5 bg-sheet-accent" aria-hidden />
      <div className="py-3 text-center">
        {gregorianPrimary ? (
          <>
            <h1 className={primaryTitle}>{gregorianDateLine}</h1>
            <p className={secondaryLine}>{ethiopianDateLine}</p>
          </>
        ) : (
          <>
            <h1 className={primaryTitle}>{ethiopianDateLine}</h1>
            <p className={secondaryLine}>{gregorianDateLine}</p>
          </>
        )}
        <p className="mt-0.5 text-[11px] text-neutral-500 tabular-nums dark:text-neutral-500">
          Planner year {gregorianPlannerYear}
        </p>
      </div>
    </header>
  );
}
