import type { MonthKey } from "@/lib/calendar-2026";
import { buildMonthWeeks } from "@/lib/build-month-weeks";
import { getMiniGridCellClasses } from "@/lib/mini-grid-progress";

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

type Props = {
  monthKey: MonthKey;
  gregorianYear: number;
  yearProgress?: boolean;
  onDayClick?: (monthKey: MonthKey, day: number) => void;
};

export function MonthMiniGrid({
  monthKey,
  gregorianYear,
  yearProgress = false,
  onDayClick,
}: Props) {
  const weeks = buildMonthWeeks(monthKey, gregorianYear);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-panel text-[10px] leading-none text-foreground">
      <div className="grid shrink-0 grid-cols-7 border-b border-border-strong bg-neutral-800 dark:bg-slate-700">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-l border-border-strong py-0.5 text-center font-bold text-white first:border-l-0"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 border-dashboard-dotted">
        {weeks.flatMap((week, wi) =>
          week.map((cell, ci) => {
            const base =
              "flex min-h-[18px] items-center justify-center border-dashboard-dotted py-0.5 font-medium tabular-nums";
            const progress = getMiniGridCellClasses(
              monthKey,
              cell,
              yearProgress,
              gregorianYear
            );

            if (cell.kind === "padding") {
              return (
                <div
                  key={`p-${wi}-${ci}`}
                  className={`${base} ${progress}`}
                  aria-hidden
                />
              );
            }

            const day = cell.day;
            return (
              <button
                key={`d-${wi}-${ci}`}
                type="button"
                onClick={() => onDayClick?.(monthKey, day)}
                title={`Open ${monthKey} ${day}`}
                className={`${base} ${progress} w-full cursor-pointer hover:brightness-95 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500`}
              >
                {day}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
