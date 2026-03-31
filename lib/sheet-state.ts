import type { MonthKey } from "./calendar-2026";
import {
  JANUARY_2026_TASKS,
  MONTH_ORDER,
  type TaskLine,
} from "./calendar-2026";
import { monthKeyToIndex } from "./build-month-weeks";
import { getEthiopiaTodayGregorian } from "./ethiopia-civil-date";
import { LEGACY_PLANNER_YEAR } from "./planner-year";

export const QUARTER_NOTE_ROW_COUNT = 8;

export const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"] as const;
export type QuarterLabel = (typeof QUARTER_LABELS)[number];

export const STORAGE_QUARTER_NOTES = "warmap-quarter-notes";
export const STORAGE_DAY_CELLS = "warmap-day-cells";
export const STORAGE_MONTH_FOOTER = "warmap-month-footer";
export const STORAGE_FIELD_DONE = "warmap-field-done";
export const STORAGE_ACTIVE_VIEW = "warmap-active-view";
/** Bottom month tabs: Gregorian JAN–DEC vs Ethiopian months for the planner year. */
export const STORAGE_CALENDAR_TAB_MODE = "warmap-calendar-tab-mode";
/** Bumped so default-on applies without inheriting legacy auto-saved `"0"`. */
export const STORAGE_DASHBOARD_YEAR_PROGRESS =
  "warmap-dashboard-year-progress-v2";

/** Single-line sub-cells under each calendar day. */
export const DAY_SUB_ROWS = 6;

/** Shared styling for day sub-rows and month footer inputs (spreadsheet lines). */
export const CALENDAR_SUB_ROW_INPUT_CLASS =
  "box-border h-[18px] w-full shrink-0 border-l border-r border-b border-[#d3d3d3] bg-transparent px-0.5 text-[10px] leading-none text-black outline-none first:border-t focus:relative focus:z-10 focus:border-blue-500";

export type MonthFooterSlice = {
  objectives: string[];
  notes: string[];
};

export function emptyMonthFooterSlice(): MonthFooterSlice {
  const blank = () => Array.from({ length: DAY_SUB_ROWS }, () => "");
  return { objectives: blank(), notes: blank() };
}

export function createInitialMonthFooter(): Record<MonthKey, MonthFooterSlice> {
  const out = {} as Record<MonthKey, MonthFooterSlice>;
  for (const k of MONTH_ORDER) out[k] = emptyMonthFooterSlice();
  return out;
}

export function parseStoredMonthFooter(
  raw: string | null
): Record<MonthKey, MonthFooterSlice> | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const root = data as Record<string, unknown>;
    const out = createInitialMonthFooter();
    for (const key of MONTH_ORDER) {
      const slice = root[key];
      if (!slice || typeof slice !== "object") continue;
      const o = slice as Record<string, unknown>;
      if (Array.isArray(o.objectives)) {
        out[key].objectives = ensureSixLines(
          o.objectives.map((v) => String(v ?? ""))
        );
      }
      if (Array.isArray(o.notes)) {
        out[key].notes = ensureSixLines(
          o.notes.map((v) => String(v ?? ""))
        );
      }
    }
    return out;
  } catch {
    return null;
  }
}

function tasksToSixLines(tasks: TaskLine[]): string[] {
  return Array.from({ length: DAY_SUB_ROWS }, (_, i) => tasks[i]?.text ?? "");
}

export function emptyDayCellTexts(): Record<MonthKey, Record<number, string[]>> {
  const out = {} as Record<MonthKey, Record<number, string[]>>;
  for (const k of MONTH_ORDER) out[k] = {};
  return out;
}

export function ensureSixLines(lines: string[] | undefined): string[] {
  return Array.from({ length: DAY_SUB_ROWS }, (_, i) => String(lines?.[i] ?? ""));
}

export function ensureSixBools(arr: boolean[] | undefined): boolean[] {
  return Array.from({ length: DAY_SUB_ROWS }, (_, i) => Boolean(arr?.[i]));
}

export function ensureQuarterRowBools(arr: boolean[] | undefined): boolean[] {
  return Array.from({ length: QUARTER_NOTE_ROW_COUNT }, (_, i) =>
    Boolean(arr?.[i])
  );
}

export type FieldDoneState = {
  /** Gregorian dashboard Q1–Q4 note checkboxes. */
  quarterNotes: Record<QuarterLabel, boolean[]>;
  /** Ethiopian dashboard Q1–Q4 (Meskerem-based); separate from Gregorian when switching tabs. */
  quarterNotesEthiopian: Record<QuarterLabel, boolean[]>;
  dayLines: Record<MonthKey, Record<number, boolean[]>>;
  monthFooter: Record<
    MonthKey,
    { objectives: boolean[]; notes: boolean[] }
  >;
};

function emptyQuarterNotesDone(): Record<QuarterLabel, boolean[]> {
  const quarterNotes = {} as Record<QuarterLabel, boolean[]>;
  for (const l of QUARTER_LABELS) {
    quarterNotes[l] = Array.from({ length: QUARTER_NOTE_ROW_COUNT }, () => false);
  }
  return quarterNotes;
}

export function createInitialFieldDone(): FieldDoneState {
  const dayLines = {} as Record<MonthKey, Record<number, boolean[]>>;
  for (const m of MONTH_ORDER) dayLines[m] = {};
  const monthFooter = {} as FieldDoneState["monthFooter"];
  for (const m of MONTH_ORDER) {
    monthFooter[m] = {
      objectives: ensureSixBools(undefined),
      notes: ensureSixBools(undefined),
    };
  }
  return {
    quarterNotes: emptyQuarterNotesDone(),
    quarterNotesEthiopian: emptyQuarterNotesDone(),
    dayLines,
    monthFooter,
  };
}

export function parseStoredFieldDone(raw: string | null): FieldDoneState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const root = data as Record<string, unknown>;
    const out = createInitialFieldDone();

    const qn = root.quarterNotes;
    if (qn && typeof qn === "object") {
      for (const label of QUARTER_LABELS) {
        const arr = (qn as Record<string, unknown>)[label];
        if (Array.isArray(arr)) {
          out.quarterNotes[label] = ensureQuarterRowBools(
            arr.map((v) => Boolean(v))
          );
        }
      }
    }

    const qnEt = root.quarterNotesEthiopian;
    if (qnEt && typeof qnEt === "object") {
      for (const label of QUARTER_LABELS) {
        const arr = (qnEt as Record<string, unknown>)[label];
        if (Array.isArray(arr)) {
          out.quarterNotesEthiopian[label] = ensureQuarterRowBools(
            arr.map((v) => Boolean(v))
          );
        }
      }
    }

    const dl = root.dayLines;
    if (dl && typeof dl === "object") {
      for (const mk of MONTH_ORDER) {
        const monthObj = (dl as Record<string, unknown>)[mk];
        if (!monthObj || typeof monthObj !== "object") continue;
        for (const [dayStr, arr] of Object.entries(monthObj)) {
          const d = Number(dayStr);
          if (!Number.isFinite(d)) continue;
          if (Array.isArray(arr)) {
            out.dayLines[mk][d] = ensureSixBools(arr.map(Boolean));
          }
        }
      }
    }

    const mf = root.monthFooter;
    if (mf && typeof mf === "object") {
      for (const mk of MONTH_ORDER) {
        const slice = (mf as Record<string, unknown>)[mk];
        if (!slice || typeof slice !== "object") continue;
        const o = slice as Record<string, unknown>;
        if (Array.isArray(o.objectives)) {
          out.monthFooter[mk].objectives = ensureSixBools(
            o.objectives.map(Boolean)
          );
        }
        if (Array.isArray(o.notes)) {
          out.monthFooter[mk].notes = ensureSixBools(o.notes.map(Boolean));
        }
      }
    }

    return out;
  } catch {
    return null;
  }
}

function normalizeStoredDayValue(val: unknown): string[] {
  if (Array.isArray(val)) {
    return ensureSixLines(val.map((v) => String(v ?? "")));
  }
  if (typeof val === "string") {
    const parts = val.split("\n");
    return ensureSixLines(parts);
  }
  return ensureSixLines(undefined);
}

/** Sample January tasks only for the original demo year (legacy installs). */
export function createInitialDayCellTextsForYear(
  gregorianYear: number
): Record<MonthKey, Record<number, string[]>> {
  const out = emptyDayCellTexts();
  if (gregorianYear !== LEGACY_PLANNER_YEAR) return out;
  for (const [dayStr, tasks] of Object.entries(JANUARY_2026_TASKS)) {
    out.jan[Number(dayStr)] = tasksToSixLines(tasks);
  }
  return out;
}

/** @deprecated Use createInitialDayCellTextsForYear(getPlannerGregorianYear()). */
export function createInitialDayCellTexts(): Record<
  MonthKey,
  Record<number, string[]>
> {
  return createInitialDayCellTextsForYear(LEGACY_PLANNER_YEAR);
}

export function createInitialQuarterNotes(): Record<QuarterLabel, string[]> {
  const empty = () =>
    Array.from({ length: QUARTER_NOTE_ROW_COUNT }, () => "");
  return {
    Q1: empty(),
    Q2: empty(),
    Q3: empty(),
    Q4: empty(),
  };
}

export function parseStoredQuarterNotes(
  raw: string | null
): Record<QuarterLabel, string[]> | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    const out: Record<QuarterLabel, string[]> = {
      Q1: [],
      Q2: [],
      Q3: [],
      Q4: [],
    };
    for (const label of QUARTER_LABELS) {
      const arr = o[label];
      if (!Array.isArray(arr)) return null;
      out[label] = Array.from({ length: QUARTER_NOTE_ROW_COUNT }, (_, i) =>
        String(arr[i] ?? "")
      );
    }
    return out;
  } catch {
    return null;
  }
}

export function parseStoredDayCellTexts(
  raw: string | null
): Record<MonthKey, Record<number, string[]>> | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const root = data as Record<string, unknown>;
    const out = emptyDayCellTexts();
    for (const key of MONTH_ORDER) {
      const monthObj = root[key];
      if (!monthObj || typeof monthObj !== "object") continue;
      for (const [dayStr, val] of Object.entries(monthObj as Record<string, unknown>)) {
        const d = Number(dayStr);
        if (!Number.isFinite(d)) continue;
        out[key][d] = normalizeStoredDayValue(val);
      }
    }
    return out;
  } catch {
    return null;
  }
}

/** True when this cell is “today” (Gregorian civil date in Ethiopia / Addis Ababa). */
export function isCalendarToday(
  monthKey: MonthKey,
  day: number,
  plannerGregorianYear: number
): boolean {
  const t = getEthiopiaTodayGregorian();
  return (
    t.year === plannerGregorianYear &&
    t.month === monthKeyToIndex(monthKey) + 1 &&
    t.day === day
  );
}

/** True when Ethiopia’s current Gregorian month matches this planner month. */
export function isCalendarActiveMonth(
  monthKey: MonthKey,
  plannerGregorianYear: number
): boolean {
  const t = getEthiopiaTodayGregorian();
  return (
    t.year === plannerGregorianYear &&
    t.month === monthKeyToIndex(monthKey) + 1
  );
}
