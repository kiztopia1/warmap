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

const FOOTER_INPUT_COUNT = DAY_SUB_ROWS * 2;

type Props = {
  objectives: string[];
  notes: string[];
  objectivesDone?: boolean[];
  notesDone?: boolean[];
  onObjectivesChange: (index: number, value: string) => void;
  onNotesChange: (index: number, value: string) => void;
  onToggleObjectiveDone: (index: number) => void;
  onToggleNoteDone: (index: number) => void;
};

export function MonthCalendarFooter({
  objectives,
  notes,
  objectivesDone,
  notesDone,
  onObjectivesChange,
  onNotesChange,
  onToggleObjectiveDone,
  onToggleNoteDone,
}: Props) {
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setCellRef = (globalIndex: number) => (el: HTMLInputElement | null) => {
    cellRefs.current[globalIndex] = el;
  };

  const focusNext = (globalIndex: number) => {
    const next = globalIndex + 1;
    if (next < FOOTER_INPUT_COUNT) {
      cellRefs.current[next]?.focus();
    }
  };

  const onKeyDown = (globalIndex: number, toggle: () => void) => (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    spreadsheetLineKeyDown(e, {
      onMoveNext: () => focusNext(globalIndex),
      onToggleDone: toggle,
    });
  };

  const obj = ensureSixLines(objectives);
  const nts = ensureSixLines(notes);
  const objDone = ensureSixBools(objectivesDone);
  const ntsDone = ensureSixBools(notesDone);

  return (
    <div className="grid grid-cols-7 border-b border-t border-border-strong bg-panel">
      <div
        className="col-span-2 min-h-[calc(1.5rem+6*18px)] border-r border-border-strong bg-padding-day"
        aria-hidden
      />
      <div className="col-span-3 flex min-w-0 flex-col border-r border-border-strong">
        <div className="border-b border-border-strong px-1 py-0.5 text-[10px] font-bold leading-tight text-foreground">
          Main Objectives:
        </div>
        <div className="flex flex-col">
          {Array.from({ length: DAY_SUB_ROWS }, (_, i) => (
            <input
              key={`o-${i}`}
              ref={setCellRef(i)}
              type="text"
              value={obj[i]}
              onChange={(e) => onObjectivesChange(i, e.target.value)}
              onKeyDown={onKeyDown(i, () => onToggleObjectiveDone(i))}
              spellCheck={false}
              autoComplete="off"
              className={`${CALENDAR_SUB_ROW_INPUT_CLASS} ${objDone[i] ? "line-through decoration-foreground" : ""}`}
              aria-label={`Main objective row ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="col-span-2 flex min-w-0 flex-col">
        <div className="border-b border-border-strong px-1 py-0.5 text-[10px] font-bold leading-tight text-foreground">
          Notes:
        </div>
        <div className="flex flex-col">
          {Array.from({ length: DAY_SUB_ROWS }, (_, i) => {
            const g = DAY_SUB_ROWS + i;
            return (
              <input
                key={`n-${i}`}
                ref={setCellRef(g)}
                type="text"
                value={nts[i]}
                onChange={(e) => onNotesChange(i, e.target.value)}
                onKeyDown={onKeyDown(g, () => onToggleNoteDone(i))}
                spellCheck={false}
                autoComplete="off"
                className={`${CALENDAR_SUB_ROW_INPUT_CLASS} ${ntsDone[i] ? "line-through decoration-foreground" : ""}`}
                aria-label={`Month note row ${i + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
