import type { MonthKey } from "./calendar-2026";
import { LEGACY_PLANNER_YEAR } from "./planner-year";
import {
  createInitialDayCellTextsForYear,
  createInitialFieldDone,
  createInitialMonthFooter,
  createInitialQuarterNotes,
  parseStoredDayCellTexts,
  parseStoredFieldDone,
  parseStoredMonthFooter,
  parseStoredQuarterNotes,
  STORAGE_DAY_CELLS,
  STORAGE_FIELD_DONE,
  STORAGE_MONTH_FOOTER,
  STORAGE_QUARTER_NOTES,
  type FieldDoneState,
  type MonthFooterSlice,
  type QuarterLabel,
} from "./sheet-state";

export const STORAGE_PLANNER_BY_YEAR = "warmap-planner-by-year";

export type PlannerYearBundle = {
  /** Gregorian dashboard quarter notes (Jan-based Q1–Q4). */
  quarterNotes: Record<QuarterLabel, string[]>;
  /** Ethiopian dashboard quarter notes (Meskerem-based Q1–Q4); independent of Gregorian. */
  quarterNotesEthiopian: Record<QuarterLabel, string[]>;
  dayCellTexts: Record<MonthKey, Record<number, string[]>>;
  monthFooter: Record<MonthKey, MonthFooterSlice>;
  fieldDone: FieldDoneState;
};

function emptyBundleForYear(year: number): PlannerYearBundle {
  return {
    quarterNotes: createInitialQuarterNotes(),
    quarterNotesEthiopian: createInitialQuarterNotes(),
    dayCellTexts: createInitialDayCellTextsForYear(year),
    monthFooter: createInitialMonthFooter(),
    fieldDone: createInitialFieldDone(),
  };
}

function isByYearRoot(data: unknown): data is Record<string, PlannerYearBundle> {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return false;
  return keys.every((k) => /^\d{4}$/.test(k));
}

function parseBundleFromUnknown(data: unknown, year: number): PlannerYearBundle | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const out = emptyBundleForYear(year);

  const q = root.quarterNotes;
  if (q && typeof q === "object") {
    const parsed = parseStoredQuarterNotes(JSON.stringify(q));
    if (parsed) out.quarterNotes = parsed;
  }

  const qEt = root.quarterNotesEthiopian;
  if (qEt && typeof qEt === "object") {
    const parsed = parseStoredQuarterNotes(JSON.stringify(qEt));
    if (parsed) out.quarterNotesEthiopian = parsed;
  }

  const dc = root.dayCellTexts ?? root.dayCells;
  if (dc && typeof dc === "object") {
    const parsed = parseStoredDayCellTexts(JSON.stringify(dc));
    if (parsed) out.dayCellTexts = parsed;
  }

  const mf = root.monthFooter;
  if (mf && typeof mf === "object") {
    const parsed = parseStoredMonthFooter(JSON.stringify(mf));
    if (parsed) out.monthFooter = parsed;
  }

  const fd = root.fieldDone;
  if (fd && typeof fd === "object") {
    const parsed = parseStoredFieldDone(JSON.stringify(fd));
    if (parsed) out.fieldDone = parsed;
  }

  return out;
}

/** Migrate flat localStorage keys into a single-year bundle (legacy install). */
function migrateLegacyFlatToBundle(): PlannerYearBundle {
  const year = LEGACY_PLANNER_YEAR;
  const bundle = emptyBundleForYear(year);
  const q = parseStoredQuarterNotes(
    localStorage.getItem(STORAGE_QUARTER_NOTES)
  );
  if (q) bundle.quarterNotes = q;
  /* Legacy single quarter column was Gregorian; Ethiopian starts empty. */
  const d = parseStoredDayCellTexts(localStorage.getItem(STORAGE_DAY_CELLS));
  if (d) bundle.dayCellTexts = d;
  const f = parseStoredMonthFooter(localStorage.getItem(STORAGE_MONTH_FOOTER));
  if (f) bundle.monthFooter = f;
  const fd = parseStoredFieldDone(localStorage.getItem(STORAGE_FIELD_DONE));
  if (fd) bundle.fieldDone = fd;
  return bundle;
}

function hasAnyLegacyPlannerKeys(): boolean {
  try {
    return Boolean(
      localStorage.getItem(STORAGE_QUARTER_NOTES) ||
        localStorage.getItem(STORAGE_DAY_CELLS) ||
        localStorage.getItem(STORAGE_MONTH_FOOTER) ||
        localStorage.getItem(STORAGE_FIELD_DONE)
    );
  } catch {
    return false;
  }
}

function readAllYearsFromStorage(): Record<string, PlannerYearBundle> {
  try {
    const raw = localStorage.getItem(STORAGE_PLANNER_BY_YEAR);
    if (raw) {
      const data = JSON.parse(raw) as unknown;
      if (isByYearRoot(data)) {
        return data as Record<string, PlannerYearBundle>;
      }
    }
    if (hasAnyLegacyPlannerKeys()) {
      const migrated = migrateLegacyFlatToBundle();
      const initial: Record<string, PlannerYearBundle> = {
        [String(LEGACY_PLANNER_YEAR)]: migrated,
      };
      try {
        localStorage.setItem(STORAGE_PLANNER_BY_YEAR, JSON.stringify(initial));
      } catch {
        /* ignore */
      }
      return initial;
    }
    return {};
  } catch {
    return {};
  }
}

export function loadPlannerBundleForYear(year: number): PlannerYearBundle {
  const all = readAllYearsFromStorage();
  const key = String(year);
  const existing = all[key];
  if (existing) {
    const parsed = parseBundleFromUnknown(existing, year);
    if (parsed) return parsed;
  }
  return emptyBundleForYear(year);
}

export function savePlannerBundleForYear(
  year: number,
  bundle: PlannerYearBundle
): void {
  try {
    const all = readAllYearsFromStorage();
    all[String(year)] = bundle;
    localStorage.setItem(STORAGE_PLANNER_BY_YEAR, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
}
