import type { MonthKey, QuarterDef } from "@/lib/calendar-2026";
import { spreadsheetLineKeyDown } from "@/lib/spreadsheet-input";
import {
  QUARTER_NOTE_ROW_COUNT,
  ensureQuarterRowBools,
} from "@/lib/sheet-state";
import { MonthMiniGrid } from "./MonthMiniGrid";

type Props = {
  quarter: QuarterDef;
  gregorianYear: number;
  noteRows: string[];
  noteDone?: boolean[];
  onNoteChange: (rowIndex: number, value: string) => void;
  onToggleNoteDone: (rowIndex: number) => void;
  /** When true, dashboard mini-grids gray out past days and highlight today. */
  yearProgress?: boolean;
  onDashboardDayClick?: (
    gregorianYear: number,
    monthKey: MonthKey,
    day: number
  ) => void;
};

export function QuarterRow({
  quarter,
  gregorianYear,
  noteRows,
  noteDone,
  onNoteChange,
  onToggleNoteDone,
  yearProgress = false,
  onDashboardDayClick,
}: Props) {
  const rows = noteRows.slice(0, QUARTER_NOTE_ROW_COUNT);
  while (rows.length < QUARTER_NOTE_ROW_COUNT) rows.push("");
  const doneFlags = ensureQuarterRowBools(noteDone);

  return (
    <div className="grid min-h-[140px] grid-cols-[minmax(5rem,0.9fr)_repeat(3,minmax(0,1fr))] border-b border-border-strong">
      <div className="flex min-w-0 flex-col border-r border-border-strong">
        <div className="bg-header-bar-bg py-1.5 text-center text-xs font-bold text-header-bar-fg">
          {quarter.label}
        </div>
        <div className="flex flex-1 flex-col bg-panel">
          {rows.map((value, i) => (
            <div
              key={i}
              className="flex min-h-[22px] flex-1 border-b border-dotted border-border-dotted last:border-b-0"
            >
              <input
                type="text"
                value={value}
                onChange={(e) => onNoteChange(i, e.target.value)}
                onKeyDown={(e) =>
                  spreadsheetLineKeyDown(e, {
                    onToggleDone: () => onToggleNoteDone(i),
                  })
                }
                autoComplete="off"
                className={`min-h-0 w-full flex-1 border-0 bg-transparent px-1 py-0.5 text-[11px] text-foreground outline-none focus:bg-[var(--focus-note-bg)] ${doneFlags[i] ? "line-through decoration-foreground" : ""}`}
                aria-label={`${quarter.label} note row ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
      {quarter.months.map((m) => (
        <div
          key={m.key}
          className="flex min-w-0 flex-col border-r border-border-strong last:border-r-0"
        >
          <div className="bg-header-bar-bg py-1.5 text-center text-xs font-bold text-header-bar-fg">
            {m.abbr}
          </div>
          <MonthMiniGrid
            monthKey={m.key}
            gregorianYear={gregorianYear}
            yearProgress={yearProgress}
            onDayClick={onDashboardDayClick}
          />
        </div>
      ))}
    </div>
  );
}
