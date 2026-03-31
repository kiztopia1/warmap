import type { EthiopianDashboardColumn } from "@/lib/ethiopian-dashboard-layout";
import type { MonthKey } from "@/lib/calendar-2026";
import { spreadsheetLineKeyDown } from "@/lib/spreadsheet-input";
import {
  QUARTER_NOTE_ROW_COUNT,
  ensureQuarterRowBools,
} from "@/lib/sheet-state";
import { EthiopianMonthMiniGrid } from "./EthiopianMonthMiniGrid";
import { EthiopianNehasaePagumeMiniGrid } from "./EthiopianNehasaePagumeMiniGrid";

type Props = {
  /** Q1–Q4 label, or null for extra rows after the fourth (no note strip). */
  quarterLabel: string | null;
  columns: EthiopianDashboardColumn[];
  gregorianPlannerYear: number;
  noteRows: string[];
  noteDone?: boolean[];
  onNoteChange: (rowIndex: number, value: string) => void;
  onToggleNoteDone: (rowIndex: number) => void;
  yearProgress?: boolean;
  onDashboardDayClick?: (monthKey: MonthKey, day: number) => void;
};

function EmptyMonthColumn() {
  return (
    <div className="flex min-w-0 flex-col border-r border-border-strong bg-eth-column-empty last:border-r-0">
      <div
        className="min-h-[52px] border-b border-border-strong bg-eth-column-empty-header"
        aria-hidden
      />
      <div
        className="min-h-[120px] flex-1 bg-eth-column-empty-body"
        aria-hidden
      />
    </div>
  );
}

export function EthiopianQuarterRow({
  quarterLabel,
  columns,
  gregorianPlannerYear,
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

  const showNotes = quarterLabel !== null;
  const colTemplate = showNotes
    ? "minmax(5rem, 0.9fr) repeat(3, minmax(0, 1fr))"
    : "repeat(3, minmax(0, 1fr))";

  const noteBlock = showNotes ? (
    <div className="flex min-w-0 flex-col border-r border-border-strong">
      <div className="bg-header-bar-bg py-1.5 text-center text-xs font-bold text-header-bar-fg">
        {quarterLabel}
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
              aria-label={`${quarterLabel} note row ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div
      className="grid min-h-[140px] border-b border-border-strong"
      style={{ gridTemplateColumns: colTemplate }}
    >
      {noteBlock}
      {columns.map((col, idx) => {
        if (col.kind === "empty") {
          return <EmptyMonthColumn key={`empty-${idx}`} />;
        }
        if (col.kind === "neh-pag") {
          return (
            <div
              key={`neh-pag-${col.ethYear}`}
              className="flex min-w-0 flex-col border-r border-border-strong last:border-r-0"
            >
              <div
                className="bg-eth-month-header py-1.5 text-center text-[10px] font-bold leading-tight text-white sm:text-xs"
                title={`${col.slot12.fullLabel} + Pagumē`}
              >
                <span className="block">{col.slot12.shortLabel}</span>
                <span className="block text-[8px] font-normal text-amber-200/95">
                  + PAG
                </span>
                <span className="block text-[8px] font-semibold opacity-90 sm:text-[9px]">
                  {col.ethYear}
                </span>
              </div>
              <EthiopianNehasaePagumeMiniGrid
                ethYear={col.ethYear}
                plannerGregorianYear={gregorianPlannerYear}
                yearProgress={yearProgress}
                onDayClick={onDashboardDayClick}
              />
            </div>
          );
        }
        const slot = col.slot;
        return (
          <div
            key={`${slot.ethYear}-${slot.ethMonth}`}
            className="flex min-w-0 flex-col border-r border-border-strong last:border-r-0"
          >
            <div
              className="bg-eth-month-header py-1.5 text-center text-[10px] font-bold leading-tight text-white sm:text-xs"
              title={slot.fullLabel}
            >
              <span className="block">{slot.shortLabel}</span>
              <span className="block text-[8px] font-semibold opacity-90 sm:text-[9px]">
                {slot.ethYear}
              </span>
            </div>
            <EthiopianMonthMiniGrid
              ethYear={slot.ethYear}
              ethMonth={slot.ethMonth}
              plannerGregorianYear={gregorianPlannerYear}
              yearProgress={yearProgress}
              onDayClick={onDashboardDayClick}
            />
          </div>
        );
      })}
    </div>
  );
}
