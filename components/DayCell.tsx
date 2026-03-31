"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { spreadsheetLineKeyDown } from "@/lib/spreadsheet-input";
import {
  CALENDAR_SUB_ROW_INPUT_CLASS,
  DAY_SUB_ROWS,
  ensureSixBools,
  ensureSixLines,
} from "@/lib/sheet-state";

type PaddingProps = {
  isPadding: true;
  /** When true, use white instead of gray padding (live month / upcoming slots). */
  neutralBackground?: boolean;
};

type DayProps = {
  isPadding?: false;
  dayNumber: number;
  /** Element id for scroll-into-view when opening this day from the dashboard. */
  scrollAnchorId?: string;
  /** Ethiopian (or other) day outside planner Gregorian year — number only, no inputs. */
  displayOnly?: boolean;
  lines?: string[];
  lineDone?: boolean[];
  onLineChange?: (lineIndex: number, value: string) => void;
  onToggleLineDone?: (lineIndex: number) => void;
  taskHighlight?: boolean;
  isToday?: boolean;
};

type Props = PaddingProps | DayProps;

export function DayCell(props: Props) {
  if (props.isPadding) {
    const padBg = props.neutralBackground ? "bg-panel" : "bg-padding-day";
    return (
      <div
        className={`min-h-[100px] border border-border-strong ${padBg} sm:min-h-[120px] md:min-h-[140px]`}
        aria-hidden
      />
    );
  }
  return <DayCellInputs {...props} />;
}

function DayCellInputs({
  dayNumber,
  scrollAnchorId,
  displayOnly,
  lines,
  lineDone,
  onLineChange,
  onToggleLineDone,
  taskHighlight,
  isToday,
}: Omit<DayProps, "isPadding">) {
  const lineRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (displayOnly) {
    return (
      <div
        className="flex min-h-[100px] flex-col border border-border-strong bg-display-muted sm:min-h-[120px] md:min-h-[140px]"
        aria-hidden
      >
        <span className="shrink-0 px-1 pt-0.5 text-xs font-bold tabular-nums text-neutral-600 dark:text-neutral-400">
          {dayNumber}
        </span>
        <div className="min-h-0 flex-1 bg-display-muted-inner" />
      </div>
    );
  }

  const setLineRef = (i: number) => (el: HTMLInputElement | null) => {
    lineRefs.current[i] = el;
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    spreadsheetLineKeyDown(e, {
      onMoveNext: () => lineRefs.current[i + 1]?.focus(),
      onToggleDone: () => onToggleLineDone?.(i),
    });
  };

  const rowValues = ensureSixLines(lines);
  const doneFlags = ensureSixBools(lineDone);

  const bgClass = taskHighlight
    ? "bg-cell-highlight-yellow"
    : isToday
      ? "bg-today-light-yellow"
      : "bg-panel";

  const todayAccent =
    isToday && taskHighlight
      ? "ring-2 ring-amber-500 ring-inset"
      : isToday
        ? "ring-1 ring-amber-400/80 ring-inset"
        : "";

  return (
    <div
      id={scrollAnchorId}
      tabIndex={scrollAnchorId ? -1 : undefined}
      className={`flex min-h-[100px] flex-col border border-border-strong sm:min-h-[120px] md:min-h-[140px] ${bgClass} ${todayAccent}`}
    >
      <span className="shrink-0 px-1 pt-0.5 text-xs font-bold tabular-nums">
        {dayNumber}
      </span>
      <div className="flex min-h-0 flex-1 flex-col px-0 pb-0">
        {Array.from({ length: DAY_SUB_ROWS }, (_, i) => (
          <input
            key={i}
            ref={setLineRef(i)}
            type="text"
            value={rowValues[i]}
            onChange={(e) => onLineChange?.(i, e.target.value)}
            onKeyDown={onKeyDown(i)}
            spellCheck={false}
            autoComplete="off"
            className={`${CALENDAR_SUB_ROW_INPUT_CLASS} ${doneFlags[i] ? "line-through decoration-foreground" : ""}`}
            aria-label={`Day ${dayNumber}, line ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
