"use client";

import { useEffect } from "react";
import { JANUARY_HIGHLIGHT_DAYS, type MonthKey } from "@/lib/calendar-2026";
import { buildMonthWeeks } from "@/lib/build-month-weeks";
import {
  buildEthiopianMonthWeeks,
  isEthiopianMonthWallClock,
} from "@/lib/ethiopian-2026";
import {
  ensureSixBools,
  ensureSixLines,
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

type FooterHandlers = {
  monthFooter: MonthFooterSlice;
  monthFooterDone: { objectives: boolean[]; notes: boolean[] };
  onMonthFooterObjectivesChange: (lineIndex: number, value: string) => void;
  onMonthFooterNotesChange: (lineIndex: number, value: string) => void;
  onToggleMonthFooterObjectiveDone: (lineIndex: number) => void;
  onToggleMonthFooterNoteDone: (lineIndex: number) => void;
};

type FocusProps = {
  focusGregorian: { monthKey: MonthKey; day: number } | null;
  onFocusGregorianConsumed?: () => void;
};

type GregorianCalendarProps = FooterHandlers &
  FocusProps & {
    variant: "gregorian";
    plannerGregorianYear: number;
    monthKey: MonthKey;
    dayTexts: Record<number, string[]>;
    dayLineDone: Record<number, boolean[]>;
    onDayLineChange: (day: number, lineIndex: number, value: string) => void;
    onToggleDayLineDone: (day: number, lineIndex: number) => void;
  };

type EthiopianCalendarProps = FooterHandlers &
  FocusProps & {
    variant: "ethiopian";
    plannerGregorianYear: number;
    ethYear: number;
    ethMonth: number;
    dayCellTexts: Record<MonthKey, Record<number, string[]>>;
    dayLineDoneByMonth: Record<MonthKey, Record<number, boolean[]>>;
    onDayLineChange: (
      monthKey: MonthKey,
      day: number,
      lineIndex: number,
      value: string
    ) => void;
    onToggleDayLineDone: (
      monthKey: MonthKey,
      day: number,
      lineIndex: number
    ) => void;
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
    const { monthKey, day } = focusGregorian;
    if (day < 1) return;
    const id = `calendar-day-${monthKey}-${day}`;
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
    <div className="flex min-h-0 flex-1 flex-col border-x border-black">
      <div className="grid grid-cols-7 border-b border-t border-black">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="border-l border-black bg-black py-1.5 text-center text-[10px] font-bold text-white first:border-l-0 sm:text-xs"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr border-b border-black">
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
                  neutralBackground={
                    neutralPadding && cell.placement === "trail"
                  }
                />
              );
            }
            const day = cell.day;
            return (
              <DayCell
                key={ci}
                isPadding={false}
                dayNumber={day}
                scrollAnchorId={`calendar-day-${monthKey}-${day}`}
                lines={ensureSixLines(dayTexts[day])}
                lineDone={ensureSixBools(dayLineDone[day])}
                onLineChange={(lineIndex, value) =>
                  onDayLineChange(day, lineIndex, value)
                }
                onToggleLineDone={(lineIndex) =>
                  onToggleDayLineDone(day, lineIndex)
                }
                taskHighlight={taskHighlightForGregorianCell(monthKey, day)}
                isToday={isCalendarToday(monthKey, day, plannerGregorianYear)}
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
    dayLineDoneByMonth,
    onDayLineChange,
    onToggleDayLineDone,
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
                  neutralBackground={
                    neutralPadding && cell.placement === "trail"
                  }
                />
              );
            }
            const g = cell.gregorian;
            if (!g) {
              return (
                <DayCell
                  key={ci}
                  isPadding={false}
                  displayOnly
                  dayNumber={cell.ethDay}
                />
              );
            }
            const { monthKey, day } = g;
            return (
              <DayCell
                key={ci}
                isPadding={false}
                dayNumber={cell.ethDay}
                scrollAnchorId={`calendar-day-${monthKey}-${day}`}
                lines={ensureSixLines(dayCellTexts[monthKey]?.[day])}
                lineDone={ensureSixBools(dayLineDoneByMonth[monthKey]?.[day])}
                onLineChange={(lineIndex, value) =>
                  onDayLineChange(monthKey, day, lineIndex, value)
                }
                onToggleLineDone={(lineIndex) =>
                  onToggleDayLineDone(monthKey, day, lineIndex)
                }
                taskHighlight={taskHighlightForGregorianCell(monthKey, day)}
                isToday={isCalendarToday(monthKey, day, plannerGregorianYear)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
