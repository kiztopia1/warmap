"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { spreadsheetLineKeyDown } from "@/lib/spreadsheet-input";
import type { MiniGridDayTone } from "@/lib/mini-grid-progress";
import {
  CALENDAR_SUB_ROW_INPUT_CLASS,
  DAY_SUB_ROWS,
  ensureSixBools,
  ensureSixLines,
} from "@/lib/sheet-state";

type ProgressTone = MiniGridDayTone;

type PaddingProps = {
  isPadding: true;
  /** Background (+ optional text) classes for padding cells, aligned with dashboard mini-grid progress. */
  surfaceClass: string;
};

type DayProps = {
  isPadding?: false;
  dayNumber: number;
  /** Element id for scroll-into-view when opening this day from the dashboard. */
  scrollAnchorId?: string;
  /** Ethiopian (or other) day outside planner Gregorian year — number only, no inputs. */
  displayOnly?: boolean;
  /** When set (year-progress mode), tints the display-only cell like dashboard mini-grids. */
  displayProgressClass?: string;
  lines?: string[];
  lineDone?: boolean[];
  onLineChange?: (lineIndex: number, value: string) => void;
  onToggleLineDone?: (lineIndex: number) => void;
  taskHighlight?: boolean;
  isToday?: boolean;
  /** When true, gray past days (and related padding) like the dashboard year-progress chip. */
  yearProgress?: boolean;
  /** Ethiopia-relative past / today / default; only used when `yearProgress` is true. */
  progressTone?: ProgressTone;
};

type Props = PaddingProps | DayProps;

export function DayCell(props: Props) {
  if (props.isPadding) {
    return (
      <div
        className={`min-h-[100px] border border-border-strong sm:min-h-[120px] md:min-h-[140px] ${props.surfaceClass}`}
        aria-hidden
      />
    );
  }
  return <DayCellInputs {...props} />;
}

function DayCellInputs(props: Omit<DayProps, "isPadding">) {
  const lineRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (props.displayOnly) {
    const { dayNumber, displayProgressClass } = props;
    const shell =
      displayProgressClass?.trim() ||
      "bg-display-muted text-neutral-600 dark:text-neutral-400";
    const innerTint =
      displayProgressClass?.trim() ? "" : "bg-display-muted-inner";
    return (
      <div
        className={`flex min-h-[100px] flex-col border border-border-strong sm:min-h-[120px] md:min-h-[140px] ${shell}`}
        aria-hidden
      >
        <span
          className={`shrink-0 px-1 pt-0.5 text-xs font-bold tabular-nums ${displayProgressClass?.trim() ? "text-foreground" : ""}`}
        >
          {dayNumber}
        </span>
        <div
          className={
            innerTint
              ? `min-h-0 flex-1 ${innerTint}`
              : "min-h-0 flex-1 bg-black/5 dark:bg-black/20"
          }
        />
      </div>
    );
  }

  const {
    dayNumber,
    scrollAnchorId,
    lines,
    lineDone,
    onLineChange,
    onToggleLineDone,
    taskHighlight,
    isToday,
    yearProgress = false,
    progressTone = "default",
  } = props;

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

  const pastMuted = "bg-neutral-300 dark:bg-slate-600";

  const bgClass = isToday
    ? taskHighlight
      ? "bg-cell-highlight-yellow"
      : "bg-today-light-yellow"
    : yearProgress && progressTone === "past"
      ? pastMuted
      : taskHighlight
        ? "bg-cell-highlight-yellow"
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
