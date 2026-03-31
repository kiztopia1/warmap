type Props = {
  /** Full Ethiopian civil date line (e.g. Megabit 20, 2018 E.C.). */
  ethiopianDateLine: string;
  /** Matching Gregorian civil date in Ethiopia (Addis Ababa). */
  ethiopiaGregorianLine: string;
  /** Gregorian year used for planner grids. */
  gregorianPlannerYear: number;
};

export function DashboardHeader({
  ethiopianDateLine,
  ethiopiaGregorianLine,
  gregorianPlannerYear,
}: Props) {
  return (
    <header className="shrink-0">
      <div className="h-1.5 bg-sheet-accent" aria-hidden />
      <div className="py-3 text-center">
        <h1 className="text-xl font-bold tracking-tight text-title-blue md:text-2xl">
          {ethiopianDateLine}
        </h1>
        <p className="mt-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {ethiopiaGregorianLine}
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 tabular-nums dark:text-neutral-500">
          Planner year {gregorianPlannerYear}
        </p>
      </div>
    </header>
  );
}
