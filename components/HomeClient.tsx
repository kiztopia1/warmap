"use client";

import { toEthiopian } from "ethiopian-calendar-new";
import { getEthiopiaTodayGregorian } from "@/lib/ethiopia-civil-date";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildQuartersForYear,
  defaultGregorianMonthView,
  parseActiveViewToken,
  serializeActiveView,
  type ActiveView,
  type CalendarTabMode,
  type MonthKey,
} from "@/lib/calendar-2026";
import { buildEthiopianDashboardRows } from "@/lib/ethiopian-dashboard-layout";
import {
  defaultGregorianMonthForEthiopianTab,
  findEthiopianSlot,
  formatEthiopianDateLine,
  formatEthiopianYearRangeLabel,
  getEthiopianMonthsForPlannerDisplay,
  primaryGregorianMonthForEthiopianMonth,
  toEthiopianFromPlannerMonthDay,
} from "@/lib/ethiopian-2026";
import {
  loadPlannerBundleForYear,
  savePlannerBundleForYear,
} from "@/lib/planner-by-year-storage";
import { getPlannerGregorianYear } from "@/lib/planner-year";
import {
  createInitialDayCellTextsForYear,
  createInitialFieldDone,
  createInitialMonthFooter,
  createInitialQuarterNotes,
  ensureQuarterRowBools,
  ensureSixBools,
  ensureSixLines,
  QUARTER_LABELS,
  STORAGE_ACTIVE_VIEW,
  STORAGE_CALENDAR_TAB_MODE,
  STORAGE_DASHBOARD_YEAR_PROGRESS,
  type QuarterLabel,
} from "@/lib/sheet-state";
import { BottomTabs } from "./BottomTabs";
import { DashboardCalendarMenu } from "./DashboardCalendarMenu";
import { DashboardHeader } from "./DashboardHeader";
import { EthiopianQuarterRow } from "./EthiopianQuarterRow";
import { MonthCalendarView } from "./MonthCalendarView";
import { QuarterRow } from "./QuarterRow";
import { SidebarKey } from "./SidebarKey";

function readInitialSession(): {
  active: ActiveView;
  calendarTabMode: CalendarTabMode;
} {
  const gy = getPlannerGregorianYear();
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_VIEW);
    let active: ActiveView =
      parseActiveViewToken(raw) ?? defaultGregorianMonthView();
    if (active !== "dashboard" && active.kind === "ethiopian") {
      if (!findEthiopianSlot(active.ethYear, active.ethMonth, gy)) {
        active = defaultGregorianMonthView();
      }
    }
    let calendarTabMode: CalendarTabMode = "gregorian";
    const tabRaw = localStorage.getItem(STORAGE_CALENDAR_TAB_MODE);
    if (active !== "dashboard") {
      calendarTabMode =
        active.kind === "ethiopian" ? "ethiopian" : "gregorian";
    } else if (tabRaw === "ethiopian" || tabRaw === "gregorian") {
      calendarTabMode = tabRaw;
    }
    return { active, calendarTabMode };
  } catch {
    return {
      active: defaultGregorianMonthView(),
      calendarTabMode: "gregorian",
    };
  }
}

function readDashboardYearProgress(): boolean {
  try {
    return localStorage.getItem(STORAGE_DASHBOARD_YEAR_PROGRESS) !== "0";
  } catch {
    return true;
  }
}

export function HomeClient() {
  const [initialSession] = useState(() => readInitialSession());
  const [active, setActive] = useState<ActiveView>(initialSession.active);
  const [calendarTabMode, setCalendarTabMode] = useState<CalendarTabMode>(
    initialSession.calendarTabMode
  );

  const [plannerWallYear, setPlannerWallYear] = useState(getPlannerGregorianYear);
  const [loadedYear, setLoadedYear] = useState<number | null>(null);

  const [quarterNotesGregorian, setQuarterNotesGregorian] = useState(
    createInitialQuarterNotes
  );
  const [quarterNotesEthiopian, setQuarterNotesEthiopian] = useState(
    createInitialQuarterNotes
  );
  const [dayCellTexts, setDayCellTexts] = useState(() =>
    createInitialDayCellTextsForYear(getPlannerGregorianYear())
  );
  const [monthFooter, setMonthFooter] = useState(createInitialMonthFooter);
  const [fieldDone, setFieldDone] = useState(createInitialFieldDone);
  const [hydrated, setHydrated] = useState(false);
  const [dashboardYearProgress, setDashboardYearProgress] = useState(
    readDashboardYearProgress
  );
  const [focusGregorian, setFocusGregorian] = useState<{
    monthKey: MonthKey;
    day: number;
  } | null>(null);

  const plannerDataYear = loadedYear ?? plannerWallYear;

  const quarters = useMemo(
    () => buildQuartersForYear(plannerDataYear),
    [plannerDataYear]
  );
  const ethiopianMonthSlots = useMemo(
    () => getEthiopianMonthsForPlannerDisplay(plannerDataYear),
    [plannerDataYear]
  );
  const ethiopianDashboardRows = useMemo(
    () => buildEthiopianDashboardRows(ethiopianMonthSlots),
    [ethiopianMonthSlots]
  );
  const ethiopianYearRangeLabel = useMemo(
    () => formatEthiopianYearRangeLabel(plannerDataYear),
    [plannerDataYear]
  );

  const gTodayEthiopia = getEthiopiaTodayGregorian();
  const ethToday = toEthiopian(
    gTodayEthiopia.year,
    gTodayEthiopia.month,
    gTodayEthiopia.day
  );
  const ethiopianDateLine = formatEthiopianDateLine(ethToday);
  const ethiopiaGregorianLine = `Gregorian (Ethiopia) ${gTodayEthiopia.year}-${String(gTodayEthiopia.month).padStart(2, "0")}-${String(gTodayEthiopia.day).padStart(2, "0")}`;

  const clearFocusGregorian = useCallback(() => {
    setFocusGregorian(null);
  }, []);

  useEffect(() => {
    const sync = () => {
      const y = getPlannerGregorianYear();
      setPlannerWallYear((prev) => (y !== prev ? y : prev));
    };
    const id = setInterval(sync, 60_000);
    const onVis = () => sync();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const y = getPlannerGregorianYear();
    setPlannerWallYear(y);
    const b = loadPlannerBundleForYear(y);
    startTransition(() => {
      setQuarterNotesGregorian(b.quarterNotes);
      setQuarterNotesEthiopian(b.quarterNotesEthiopian);
      setDayCellTexts(b.dayCellTexts);
      setMonthFooter(b.monthFooter);
      setFieldDone(b.fieldDone);
      setLoadedYear(y);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || loadedYear === null) return;
    if (plannerWallYear === loadedYear) return;
    savePlannerBundleForYear(loadedYear, {
      quarterNotes: quarterNotesGregorian,
      quarterNotesEthiopian: quarterNotesEthiopian,
      dayCellTexts,
      monthFooter,
      fieldDone,
    });
    const b = loadPlannerBundleForYear(plannerWallYear);
    startTransition(() => {
      setQuarterNotesGregorian(b.quarterNotes);
      setQuarterNotesEthiopian(b.quarterNotesEthiopian);
      setDayCellTexts(b.dayCellTexts);
      setMonthFooter(b.monthFooter);
      setFieldDone(b.fieldDone);
      setLoadedYear(plannerWallYear);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to calendar year change; fields snapshotted from this render
  }, [plannerWallYear, loadedYear, hydrated]);

  useEffect(() => {
    if (!hydrated || loadedYear === null) return;
    savePlannerBundleForYear(loadedYear, {
      quarterNotes: quarterNotesGregorian,
      quarterNotesEthiopian: quarterNotesEthiopian,
      dayCellTexts,
      monthFooter,
      fieldDone,
    });
  }, [
    quarterNotesGregorian,
    quarterNotesEthiopian,
    dayCellTexts,
    monthFooter,
    fieldDone,
    loadedYear,
    hydrated,
  ]);

  const applyCalendarTabMode = useCallback(
    (mode: CalendarTabMode) => {
      setCalendarTabMode(mode);
      setActive((prev) => {
        if (prev === "dashboard") return prev;
        if (mode === "ethiopian" && prev.kind === "gregorian") {
          const e = toEthiopianFromPlannerMonthDay(
            prev.month,
            15,
            plannerDataYear
          );
          return { kind: "ethiopian", ethYear: e.year, ethMonth: e.month };
        }
        if (mode === "gregorian" && prev.kind === "ethiopian") {
          const mk = defaultGregorianMonthForEthiopianTab(
            prev.ethYear,
            prev.ethMonth,
            plannerDataYear
          );
          return { kind: "gregorian", month: mk };
        }
        return prev;
      });
    },
    [plannerDataYear]
  );

  const handleDashboardDayClick = useCallback(
    (monthKey: MonthKey, day: number) => {
      setFocusGregorian({ monthKey, day });
      if (calendarTabMode === "ethiopian") {
        const e = toEthiopianFromPlannerMonthDay(
          monthKey,
          day,
          plannerDataYear
        );
        setActive({ kind: "ethiopian", ethYear: e.year, ethMonth: e.month });
      } else {
        setActive({ kind: "gregorian", month: monthKey });
      }
    },
    [calendarTabMode, plannerDataYear]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_VIEW, serializeActiveView(active));
    } catch {
      /* ignore quota / private mode */
    }
  }, [active]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CALENDAR_TAB_MODE, calendarTabMode);
    } catch {
      /* ignore */
    }
  }, [calendarTabMode]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_DASHBOARD_YEAR_PROGRESS,
        dashboardYearProgress ? "1" : "0"
      );
    } catch {
      /* ignore */
    }
  }, [dashboardYearProgress]);

  const updateQuarterNote = (
    calendar: "gregorian" | "ethiopian",
    label: QuarterLabel,
    row: number,
    value: string
  ) => {
    const set =
      calendar === "gregorian"
        ? setQuarterNotesGregorian
        : setQuarterNotesEthiopian;
    set((prev) => ({
      ...prev,
      [label]: prev[label].map((v, i) => (i === row ? value : v)),
    }));
  };

  const updateDayLine = (
    monthKey: MonthKey,
    day: number,
    lineIndex: number,
    value: string
  ) => {
    setDayCellTexts((prev) => {
      const month = prev[monthKey];
      const next = [...ensureSixLines(month[day])];
      next[lineIndex] = value;
      return {
        ...prev,
        [monthKey]: { ...month, [day]: next },
      };
    });
  };

  const updateMonthFooterLine = (
    monthKey: MonthKey,
    section: "objectives" | "notes",
    lineIndex: number,
    value: string
  ) => {
    setMonthFooter((prev) => {
      const slice = prev[monthKey];
      const key = section;
      const next = [...ensureSixLines(slice[key])];
      next[lineIndex] = value;
      return {
        ...prev,
        [monthKey]: { ...slice, [key]: next },
      };
    });
  };

  const toggleQuarterNoteDone = (
    calendar: "gregorian" | "ethiopian",
    label: QuarterLabel,
    row: number
  ) => {
    setFieldDone((prev) => {
      const key =
        calendar === "gregorian" ? "quarterNotes" : "quarterNotesEthiopian";
      const slice = prev[key];
      const arr = [...ensureQuarterRowBools(slice[label])];
      arr[row] = !arr[row];
      return {
        ...prev,
        [key]: { ...slice, [label]: arr },
      };
    });
  };

  const toggleDayLineDone = (
    monthKey: MonthKey,
    day: number,
    lineIndex: number
  ) => {
    setFieldDone((prev) => {
      const m = prev.dayLines[monthKey];
      const lineArr = [...ensureSixBools(m[day])];
      lineArr[lineIndex] = !lineArr[lineIndex];
      return {
        ...prev,
        dayLines: {
          ...prev.dayLines,
          [monthKey]: { ...m, [day]: lineArr },
        },
      };
    });
  };

  const toggleMonthFooterObjectiveDone = (
    monthKey: MonthKey,
    lineIndex: number
  ) => {
    setFieldDone((prev) => {
      const slice = prev.monthFooter[monthKey];
      const arr = [...ensureSixBools(slice.objectives)];
      arr[lineIndex] = !arr[lineIndex];
      return {
        ...prev,
        monthFooter: {
          ...prev.monthFooter,
          [monthKey]: { ...slice, objectives: arr },
        },
      };
    });
  };

  const toggleMonthFooterNoteDone = (monthKey: MonthKey, lineIndex: number) => {
    setFieldDone((prev) => {
      const slice = prev.monthFooter[monthKey];
      const arr = [...ensureSixBools(slice.notes)];
      arr[lineIndex] = !arr[lineIndex];
      return {
        ...prev,
        monthFooter: {
          ...prev.monthFooter,
          [monthKey]: { ...slice, notes: arr },
        },
      };
    });
  };

  const ethFooterMonth =
    active !== "dashboard" && active.kind === "ethiopian"
      ? primaryGregorianMonthForEthiopianMonth(
          active.ethYear,
          active.ethMonth,
          plannerDataYear
        )
      : "jan";

  return (
    <div className="flex min-h-screen flex-col bg-page-canvas text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-1 flex-col border-x border-neutral-400 bg-panel shadow-sm dark:border-slate-600">
        {active === "dashboard" ? (
          <>
            <DashboardHeader
              ethiopianDateLine={ethiopianDateLine}
              ethiopiaGregorianLine={ethiopiaGregorianLine}
              gregorianPlannerYear={plannerDataYear}
            />
            <div className="flex min-h-0 flex-1 flex-row">
              <div className="flex min-w-0 flex-[3] flex-col border-t border-border-strong">
                {calendarTabMode === "gregorian"
                  ? quarters.map((q) => (
                      <QuarterRow
                        key={q.label}
                        quarter={q}
                        gregorianYear={plannerDataYear}
                        noteRows={
                          quarterNotesGregorian[q.label as QuarterLabel]
                        }
                        noteDone={
                          fieldDone.quarterNotes[q.label as QuarterLabel]
                        }
                        onNoteChange={(row, value) =>
                          updateQuarterNote(
                            "gregorian",
                            q.label as QuarterLabel,
                            row,
                            value
                          )
                        }
                        onToggleNoteDone={(row) =>
                          toggleQuarterNoteDone(
                            "gregorian",
                            q.label as QuarterLabel,
                            row
                          )
                        }
                        yearProgress={dashboardYearProgress}
                        onDashboardDayClick={handleDashboardDayClick}
                      />
                    ))
                  : ethiopianDashboardRows.map((columns, rowIndex) => {
                      const label =
                        rowIndex < 4
                          ? (QUARTER_LABELS[rowIndex] as QuarterLabel)
                          : null;
                      return (
                        <EthiopianQuarterRow
                          key={`eth-dash-${rowIndex}`}
                          quarterLabel={label}
                          columns={columns}
                          gregorianPlannerYear={plannerDataYear}
                          noteRows={
                            label ? quarterNotesEthiopian[label] : []
                          }
                          noteDone={
                            label ? fieldDone.quarterNotesEthiopian[label] : []
                          }
                          onNoteChange={(row, value) => {
                            if (!label) return;
                            updateQuarterNote("ethiopian", label, row, value);
                          }}
                          onToggleNoteDone={(row) => {
                            if (!label) return;
                            toggleQuarterNoteDone("ethiopian", label, row);
                          }}
                          yearProgress={dashboardYearProgress}
                          onDashboardDayClick={handleDashboardDayClick}
                        />
                      );
                    })}
              </div>
              <SidebarKey />
            </div>
            <DashboardCalendarMenu
              calendarTabMode={calendarTabMode}
              gregorianPlannerYear={plannerDataYear}
              ethiopianYearRangeLabel={ethiopianYearRangeLabel}
              onSetCalendarTabMode={applyCalendarTabMode}
            />
          </>
        ) : active.kind === "gregorian" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <MonthCalendarView
              variant="gregorian"
              plannerGregorianYear={plannerDataYear}
              monthKey={active.month}
              dayTexts={dayCellTexts[active.month]}
              dayLineDone={fieldDone.dayLines[active.month]}
              onDayLineChange={(day, lineIndex, value) =>
                updateDayLine(active.month, day, lineIndex, value)
              }
              onToggleDayLineDone={(day, lineIndex) =>
                toggleDayLineDone(active.month, day, lineIndex)
              }
              monthFooter={monthFooter[active.month]}
              monthFooterDone={fieldDone.monthFooter[active.month]}
              onMonthFooterObjectivesChange={(lineIndex, value) =>
                updateMonthFooterLine(active.month, "objectives", lineIndex, value)
              }
              onMonthFooterNotesChange={(lineIndex, value) =>
                updateMonthFooterLine(active.month, "notes", lineIndex, value)
              }
              onToggleMonthFooterObjectiveDone={(lineIndex) =>
                toggleMonthFooterObjectiveDone(active.month, lineIndex)
              }
              onToggleMonthFooterNoteDone={(lineIndex) =>
                toggleMonthFooterNoteDone(active.month, lineIndex)
              }
              focusGregorian={focusGregorian}
              onFocusGregorianConsumed={clearFocusGregorian}
              yearProgress={dashboardYearProgress}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <MonthCalendarView
              variant="ethiopian"
              plannerGregorianYear={plannerDataYear}
              ethYear={active.ethYear}
              ethMonth={active.ethMonth}
              dayCellTexts={dayCellTexts}
              dayLineDoneByMonth={fieldDone.dayLines}
              onDayLineChange={updateDayLine}
              onToggleDayLineDone={toggleDayLineDone}
              monthFooter={monthFooter[ethFooterMonth]}
              monthFooterDone={fieldDone.monthFooter[ethFooterMonth]}
              onMonthFooterObjectivesChange={(lineIndex, value) =>
                updateMonthFooterLine(ethFooterMonth, "objectives", lineIndex, value)
              }
              onMonthFooterNotesChange={(lineIndex, value) =>
                updateMonthFooterLine(ethFooterMonth, "notes", lineIndex, value)
              }
              onToggleMonthFooterObjectiveDone={(lineIndex) =>
                toggleMonthFooterObjectiveDone(ethFooterMonth, lineIndex)
              }
              onToggleMonthFooterNoteDone={(lineIndex) =>
                toggleMonthFooterNoteDone(ethFooterMonth, lineIndex)
              }
              focusGregorian={focusGregorian}
              onFocusGregorianConsumed={clearFocusGregorian}
              yearProgress={dashboardYearProgress}
            />
          </div>
        )}
        <BottomTabs
          active={active}
          onChange={setActive}
          calendarTabMode={calendarTabMode}
          gregorianPlannerYear={plannerDataYear}
          ethiopianMonthSlots={ethiopianMonthSlots}
          dashboardYearProgress={dashboardYearProgress}
          onToggleDashboardYearProgress={() =>
            setDashboardYearProgress((v) => !v)
          }
        />
      </div>
    </div>
  );
}
