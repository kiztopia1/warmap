export type MonthKey =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec";

export const MONTH_ORDER: MonthKey[] = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** Month tab that matches the given date’s calendar month (0–11 → jan–dec). */
export function monthKeyFromDate(d: Date = new Date()): MonthKey {
  return MONTH_ORDER[d.getMonth()];
}

export type MonthViewGregorian = { kind: "gregorian"; month: MonthKey };
export type MonthViewEthiopian = {
  kind: "ethiopian";
  ethYear: number;
  ethMonth: number;
};
export type MonthView = MonthViewGregorian | MonthViewEthiopian;
export type ActiveView = "dashboard" | MonthView;

/** Which month strip the bottom bar shows while on the dashboard (or when switching tabs). */
export type CalendarTabMode = "gregorian" | "ethiopian";

/** Persisted month tab: `dashboard`, `jan`…`dec`, or `e:<ethYear>:<ethMonth>`. */
export function serializeActiveView(active: ActiveView): string {
  if (active === "dashboard") return "dashboard";
  if (active.kind === "gregorian") return active.month;
  return `e:${active.ethYear}:${active.ethMonth}`;
}

/** Restore tab from `localStorage` value; invalid → null. */
export function parseActiveViewToken(raw: string | null): ActiveView | null {
  if (raw === null || raw === "") return null;
  if (raw === "dashboard") return "dashboard";
  const em = /^e:(\d+):(\d+)$/.exec(raw);
  if (em) {
    const ethYear = Number(em[1]);
    const ethMonth = Number(em[2]);
    if (
      Number.isFinite(ethYear) &&
      Number.isFinite(ethMonth) &&
      ethMonth >= 1 &&
      ethMonth <= 13
    ) {
      return { kind: "ethiopian", ethYear, ethMonth };
    }
    return null;
  }
  if ((MONTH_ORDER as readonly string[]).includes(raw)) {
    return { kind: "gregorian", month: raw as MonthKey };
  }
  return null;
}

export function defaultGregorianMonthView(
  d: Date = new Date()
): MonthViewGregorian {
  return { kind: "gregorian", month: monthKeyFromDate(d) };
}

export const MONTH_LABEL: Record<MonthKey, string> = {
  jan: "JAN",
  feb: "FEB",
  mar: "MAR",
  apr: "APR",
  may: "MAY",
  jun: "JUN",
  jul: "JUL",
  aug: "AUG",
  sep: "SEP",
  oct: "OCT",
  nov: "NOV",
  dec: "DEC",
};

export const MONTH_FULL_NAME: Record<MonthKey, string> = {
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  oct: "October",
  nov: "November",
  dec: "December",
};

export function getDaysInGregorianMonth(
  monthKey: MonthKey,
  gregorianYear: number
): number {
  const idx = MONTH_ORDER.indexOf(monthKey);
  return new Date(gregorianYear, idx + 1, 0).getDate();
}

export type QuarterDef = {
  label: string;
  months: { key: MonthKey; abbr: string; days: number }[];
};

export function buildQuartersForYear(gregorianYear: number): QuarterDef[] {
  const d = (mk: MonthKey) => getDaysInGregorianMonth(mk, gregorianYear);
  return [
    {
      label: "Q1",
      months: [
        { key: "jan", abbr: "JAN", days: d("jan") },
        { key: "feb", abbr: "FEB", days: d("feb") },
        { key: "mar", abbr: "MAR", days: d("mar") },
      ],
    },
    {
      label: "Q2",
      months: [
        { key: "apr", abbr: "APR", days: d("apr") },
        { key: "may", abbr: "MAY", days: d("may") },
        { key: "jun", abbr: "JUN", days: d("jun") },
      ],
    },
    {
      label: "Q3",
      months: [
        { key: "jul", abbr: "JUL", days: d("jul") },
        { key: "aug", abbr: "AUG", days: d("aug") },
        { key: "sep", abbr: "SEP", days: d("sep") },
      ],
    },
    {
      label: "Q4",
      months: [
        { key: "oct", abbr: "OCT", days: d("oct") },
        { key: "nov", abbr: "NOV", days: d("nov") },
        { key: "dec", abbr: "DEC", days: d("dec") },
      ],
    },
  ];
}

export type TaskLine = { text: string; done?: boolean };

/** Sample content matching the January spreadsheet reference. */
export const JANUARY_2026_TASKS: Record<number, TaskLine[]> = {
  9: [
    { text: "build an mvp for level 3 sport", done: true },
    { text: "built assets for the dupe", done: true },
    { text: "create original VS dupe ADS", done: true },
    { text: "Come up with content plan for instagram telegram", done: true },
  ],
  10: [
    { text: "Create and launch two dup ads", done: true },
    { text: "make 3 posts", done: true },
    { text: "Lundary", done: true },
  ],
  11: [{ text: "1 post on telegram" }],
  13: [{ text: "send 10 emails" }],
  17: [
    { text: "setup buisines analysis agent" },
    { text: "- check if they have website" },
    { text: "- check if they are listed on afh directories" },
    { text: "- find list of facility managers" },
  ],
};

export const JANUARY_HIGHLIGHT_DAYS = new Set<number>([17]);
