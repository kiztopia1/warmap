import type { MonthKey } from "@/lib/calendar-2026";
import { buildEthiopianMonthWeeks } from "@/lib/ethiopian-2026";
import { getEthiopianMiniGridCellClasses } from "@/lib/ethiopian-mini-grid-progress";

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

type Props = {
  ethYear: number;
  ethMonth: number;
  plannerGregorianYear: number;
  yearProgress?: boolean;
  onDayClick?: (
    gregorianYear: number,
    monthKey: MonthKey,
    day: number
  ) => void;
};

export function EthiopianMonthMiniGrid({
  ethYear,
  ethMonth,
  plannerGregorianYear,
  yearProgress = false,
  onDayClick,
}: Props) {
  const weeks = buildEthiopianMonthWeeks(
    ethYear,
    ethMonth,
    plannerGregorianYear
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-panel text-[10px] leading-none text-foreground">
      <div className="grid shrink-0 grid-cols-7 border-b border-border-strong bg-eth-month-header">
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
            const progress = getEthiopianMiniGridCellClasses(
              ethYear,
              ethMonth,
              cell,
              yearProgress
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

            const { year: gYear, monthKey, day } = cell.gregorian;
            const cls = `${base} ${progress} w-full cursor-pointer hover:brightness-95 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600`;

            return (
              <button
                key={`d-${wi}-${ci}`}
                type="button"
                onClick={() => onDayClick?.(gYear, monthKey, day)}
                title={`Open ${monthKey} ${day}, ${gYear}`}
                className={cls}
              >
                {cell.ethDay}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
