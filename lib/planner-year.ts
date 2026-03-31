/** Gregorian year used for the rolling annual planner (wall-clock local date). */
export function getPlannerGregorianYear(now: Date = new Date()): number {
  return now.getFullYear();
}

/** Year used when migrating pre–multi-year localStorage blobs. */
export const LEGACY_PLANNER_YEAR = 2026;
