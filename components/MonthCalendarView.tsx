"use client";

import { useEffect } from "react";
import { JANUARY_HIGHLIGHT_DAYS, type MonthKey } from "@/lib/calendar-2026";
import { buildMonthWeeks, type CalendarCell } from "@/lib/build-month-weeks";
import {
  buildEthiopianMonthWeeks,
  isEthiopianMonthWallClock,
  type EthiopianPlanCell,
} from "@/lib/ethiopian-2026";
import {
  getEthiopianMiniGridCellClasses,
  getEthiopianMiniGridDayTone,
} from "@/lib/ethiopian-mini-grid-progress";
import {
  getMiniGridCellClasses,
  getMiniGridDayTone,
} from "@/lib/mini-grid-progress";
import {
  ensureSixBools,
  ensureSixLines,
  getDayCellLinesForGregorianDate,
  getDayLineDoneForGregorianDate,
  isCalendarActiveMonth,
  isCalendarToday,
  type MonthFooterSlice,
} from "@/lib/sheet-state";
import { DayCell } from "./DayCell";
import { MonthCalendarFooter } from "./MonthCalendarFooter";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function taskHighlightForGregorianCell(monthKey: MonthKey, day: number): boolean {
  if (monthKey === "jan") return JANUARY_HIGHLIGHT_DAYS.has(day);
  return false;
}

function gregorianPaddingSurface(
  yearProgress: boolean,
  monthKey: MonthKey,
  cell: Extract<CalendarCell, { kind: "padding" }>,
  plannerYear: number,
  neutralPadding: boolean
): string {
  if (!yearProgress) {
    return neutralPadding && cell.placement === "trail"
      ? "bg-panel"
      : "bg-padding-day";
  }
  const p = getMiniGridCellClasses(monthKey, cell, true, plannerYear);
  if (p) return p;
  return neutralPadding && cell.placement === "trail"
    ? "bg-panel"
    : "bg-padding-day";
}

function ethiopianPaddingSurface(
  yearProgress: boolean,
  ethYear: number,
  ethMonth: number,
  cell: Extract<EthiopianPlanCell, { kind: "padding" }>,
  neutralPadding: boolean
): string {
  if (!yearProgress) {
    return neutralPadding && cell.placement === "trail"
      ? "bg-panel"
      : "bg-padding-day";
  }
  const p = getEthiopianMiniGridCellClasses(ethYear, ethMonth, cell, true);
  if (p) return p;
  return neutralPadding && cell.placement === "trail"
    ? "bg-panel"
    : "bg-padding-day";
}

type FooterHandlers = {
  monthFooter: MonthFooterSlice;
  monthFooterDone: { objectives: boolean[]; notes: boolean[] };
  onMonthFooterObjectivesChange: (lineIndex: number, value: string) => void;
  onMonthFooterNotesChange: (lineIndex: number, value: string) => void;
  onToggleMonthFooterObjectiveDone: (lineIndex: number) => void;
  onToggleMonthFooterNoteDone: (lineIndex: number) => void;
};

type FocusProps = {
  focusGregorian: {
    gregorianYear: number;
    monthKey: MonthKey;
    day: number;
  } | null;
  onFocusGregorianConsumed?: () => void;
};

type GregorianCalendarProps = FooterHandlers &
  FocusProps & {
    variant: "gregorian";
    plannerGregorianYear: number;
    monthKey: MonthKey;
    dayTexts: Record<number, string[]>;
    dayLineDone: Record<number, boolean[]>;
    onDayLineChange: (
      gregorianYear: number,
      monthKey: MonthKey,
      day: number,
      lineIndex: number,
      value: string
    ) => void;
    onToggleDayLineDone: (
      gregorianYear: number,
      monthKey: MonthKey,
      day: number,
      lineIndex: number
    ) => void;
    /** Match dashboard: gray past days when the year-progress chip is on. */
    yearProgress: boolean;
  };

type EthiopianCalendarProps = FooterHandlers &
  FocusProps & {
    variant: "ethiopian";
    plannerGregorianYear: number;
    ethYear: number;
    ethMonth: number;
    dayCellTexts: Record<MonthKey, Record<number, string[]>>;
    dayCellTextsOverflow: Record<string, string[]>;
    dayLineDoneByMonth: Record<MonthKey, Record<number, boolean[]>>;
    dayLinesOverflow: Record<string, boolean[]>;
    onDayLineChange: (
      gregorianYear: number,
      monthKey: MonthKey,
      day: number,
      lineIndex: number,
      value: string
    ) => void;
    onToggleDayLineDone: (
      gregorianYear: number,
      monthKey: MonthKey,
      day: number,
      lineIndex: number
    ) => void;
    yearProgress: boolean;
  };

type Props = GregorianCalendarProps | EthiopianCalendarProps;

export function MonthCalendarView(props: Props) {
  const {
    monthFooter,
    monthFooterDone,
    onMonthFooterObjectivesChange,
    onMonthFooterNotesChange,
    onToggleMonthFooterObjectiveDone,
    onToggleMonthFooterNoteDone,
    focusGregorian,
    onFocusGregorianConsumed,
  } = props;

  useEffect(() => {
    if (!focusGregorian) return;
    const { gregorianYear, monthKey, day } = focusGregorian;
    if (day < 1) return;
    const id = `calendar-day-${gregorianYear}-${monthKey}-${day}`;
    const handle = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      onFocusGregorianConsumed?.();
    });
    return () => cancelAnimationFrame(handle);
  }, [focusGregorian, onFocusGregorianConsumed]);

  return (
    <div className="flex min-h-0 flex-1 flex-col border-x border-border-strong">
      <div className="grid grid-cols-7 border-b border-t border-border-strong">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="border-l border-border-strong bg-header-bar-bg py-1.5 text-center text-[10px] font-bold text-header-bar-fg first:border-l-0 sm:text-xs"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr border-b border-border-strong">
        {props.variant === "gregorian" ? (
          <GregorianGrid {...props} />
        ) : (
          <EthiopianGrid {...props} />
        )}
      </div>
      <MonthCalendarFooter
        objectives={monthFooter.objectives}
        notes={monthFooter.notes}
        objectivesDone={monthFooterDone.objectives}
        notesDone={monthFooterDone.notes}
        onObjectivesChange={onMonthFooterObjectivesChange}
        onNotesChange={onMonthFooterNotesChange}
        onToggleObjectiveDone={onToggleMonthFooterObjectiveDone}
        onToggleNoteDone={onToggleMonthFooterNoteDone}
      />
    </div>
  );
}

function GregorianGrid(props: GregorianCalendarProps) {
  const {
    plannerGregorianYear,
    monthKey,
    dayTexts,
    dayLineDone,
    onDayLineChange,
    onToggleDayLineDone,
    yearProgress,
  } = props;
  const weeks = buildMonthWeeks(monthKey, plannerGregorianYear);
  const neutralPadding = isCalendarActiveMonth(monthKey, plannerGregorianYear);

  return (
    <>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((cell, ci) => {
            if (cell.kind === "padding") {
              return (
                <DayCell
                  key={ci}
                  isPadding
                  surfaceClass={gregorianPaddingSurface(
                    yearProgress,
                    monthKey,
                    cell,
                    plannerGregorianYear,
                    neutralPadding
                  )}
                />
              );
            }
            const day = cell.day;
            return (
              <DayCell
                key={ci}
                isPadding={false}
                dayNumber={day}
                scrollAnchorId={`calendar-day-${plannerGregorianYear}-${monthKey}-${day}`}
                lines={ensureSixLines(dayTexts[day])}
                lineDone={ensureSixBools(dayLineDone[day])}
                onLineChange={(lineIndex, value) =>
                  onDayLineChange(
                    plannerGregorianYear,
                    monthKey,
                    day,
                    lineIndex,
                    value
                  )
                }
                onToggleLineDone={(lineIndex) =>
                  onToggleDayLineDone(
                    plannerGregorianYear,
                    monthKey,
                    day,
                    lineIndex
                  )
                }
                taskHighlight={taskHighlightForGregorianCell(monthKey, day)}
                isToday={isCalendarToday(monthKey, day, plannerGregorianYear)}
                yearProgress={yearProgress}
                progressTone={getMiniGridDayTone(
                  monthKey,
                  day,
                  plannerGregorianYear
                )}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

function EthiopianGrid(props: EthiopianCalendarProps) {
  const {
    plannerGregorianYear,
    ethYear,
    ethMonth,
    dayCellTexts,
    dayCellTextsOverflow,
    dayLineDoneByMonth,
    dayLinesOverflow,
    onDayLineChange,
    onToggleDayLineDone,
    yearProgress,
  } = props;
  const weeks = buildEthiopianMonthWeeks(
    ethYear,
    ethMonth,
    plannerGregorianYear
  );
  const neutralPadding = isEthiopianMonthWallClock(ethYear, ethMonth);

  return (
    <>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((cell, ci) => {
            if (cell.kind === "padding") {
              return (
                <DayCell
                  key={ci}
                  isPadding
                  surfaceClass={ethiopianPaddingSurface(
                    yearProgress,
                    ethYear,
                    ethMonth,
                    cell,
                    neutralPadding
                  )}
                />
              );
            }
            const g = cell.gregorian;
            const { year: gYear, monthKey, day } = g;
            const lines = getDayCellLinesForGregorianDate(
              plannerGregorianYear,
              dayCellTexts,
              dayCellTextsOverflow,
              gYear,
              monthKey,
              day
            );
            const lineDone = getDayLineDoneForGregorianDate(
              plannerGregorianYear,
              dayLineDoneByMonth,
              dayLinesOverflow,
              gYear,
              monthKey,
              day
            );
            return (
              <DayCell
                key={ci}
                isPadding={false}
                dayNumber={cell.ethDay}
                scrollAnchorId={`calendar-day-${gYear}-${monthKey}-${day}`}
                lines={lines}
                lineDone={lineDone}
                onLineChange={(lineIndex, value) =>
                  onDayLineChange(gYear, monthKey, day, lineIndex, value)
                }
                onToggleLineDone={(lineIndex) =>
                  onToggleDayLineDone(gYear, monthKey, day, lineIndex)
                }
                taskHighlight={
                  gYear === plannerGregorianYear &&
                  taskHighlightForGregorianCell(monthKey, day)
                }
                isToday={
                  gYear === plannerGregorianYear &&
                  isCalendarToday(monthKey, day, plannerGregorianYear)
                }
                yearProgress={yearProgress}
                progressTone={getEthiopianMiniGridDayTone(
                  ethYear,
                  ethMonth,
                  cell.ethDay
                )}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
