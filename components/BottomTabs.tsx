import type { EthiopianMonthSlot } from "@/lib/ethiopian-2026";
import { ethiopianSlotKey } from "@/lib/ethiopian-2026";
import {
  MONTH_LABEL,
  MONTH_ORDER,
  type ActiveView,
  type CalendarTabMode,
  type MonthKey,
} from "@/lib/calendar-2026";

/** Accent underlines for month tabs (inactive state hint). */
const MONTH_TAB_ACCENT: Record<MonthKey, string> = {
  jan: "decoration-red-500",
  feb: "decoration-sky-400",
  mar: "decoration-orange-500",
  apr: "decoration-lime-600",
  may: "decoration-emerald-600",
  jun: "decoration-teal-500",
  jul: "decoration-blue-600",
  aug: "decoration-indigo-500",
  sep: "decoration-violet-500",
  oct: "decoration-fuchsia-500",
  nov: "decoration-rose-500",
  dec: "decoration-amber-600",
};

type Props = {
  active: ActiveView;
  onChange: (view: ActiveView) => void;
  calendarTabMode: CalendarTabMode;
  gregorianPlannerYear: number;
  ethiopianMonthSlots: EthiopianMonthSlot[];
  dashboardYearProgress: boolean;
  onToggleDashboardYearProgress: () => void;
};

function isEthiopianActive(
  active: ActiveView,
  ethYear: number,
  ethMonth: number
): boolean {
  return (
    active !== "dashboard" &&
    active.kind === "ethiopian" &&
    active.ethYear === ethYear &&
    active.ethMonth === ethMonth
  );
}

export function BottomTabs({
  active,
  onChange,
  calendarTabMode,
  gregorianPlannerYear,
  ethiopianMonthSlots,
  dashboardYearProgress,
  onToggleDashboardYearProgress,
}: Props) {
  const yearChip = String(gregorianPlannerYear).slice(-2);

  return (
    <nav
      className="sticky bottom-0 z-10 flex shrink-0 flex-wrap items-end justify-start gap-x-1 gap-y-0 border-t border-gray-400 bg-[#f1f1f1] px-1 py-1 text-[10px] sm:text-xs"
      aria-label="View"
    >
      <span className="flex items-center gap-0.5 pr-1 text-gray-600 select-none">
        <span className="px-1 font-bold" aria-hidden>
          ≡
        </span>
        <button
          type="button"
          onClick={onToggleDashboardYearProgress}
          title="Dashboard year progress: gray past days, yellow today (matches Gregorian or Ethiopian tab mode)"
          aria-label="Toggle year progress highlights on dashboard"
          aria-pressed={dashboardYearProgress}
          className={`rounded border px-0.5 py-px text-[8px] font-bold leading-none tabular-nums hover:bg-gray-200 ${
            dashboardYearProgress
              ? "border-amber-500 bg-amber-100 text-amber-900"
              : "border-gray-400 bg-white text-gray-700"
          }`}
        >
          {yearChip}
        </button>
      </span>
      <button
        type="button"
        onClick={() => onChange("dashboard")}
        className={`rounded-t px-2 py-1 font-medium underline decoration-2 underline-offset-4 ${
          active === "dashboard"
            ? "text-blue-600 decoration-blue-600"
            : "text-gray-600 decoration-transparent hover:text-gray-900"
        }`}
      >
        Dashboard{active === "dashboard" ? " ▾" : ""}
      </button>
      {calendarTabMode === "gregorian"
        ? MONTH_ORDER.map((key) => {
            const isActive =
              active !== "dashboard" &&
              active.kind === "gregorian" &&
              active.month === key;
            const accent = MONTH_TAB_ACCENT[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ kind: "gregorian", month: key })}
                className={`rounded-t px-1.5 py-1 font-semibold tracking-wide underline decoration-2 underline-offset-4 sm:px-2 ${
                  isActive
                    ? "text-blue-600 decoration-blue-600"
                    : `text-gray-700 ${accent}`
                }`}
              >
                {MONTH_LABEL[key]}
                {isActive ? " ▾" : ""}
              </button>
            );
          })
        : ethiopianMonthSlots.map((slot) => {
            const isActive = isEthiopianActive(
              active,
              slot.ethYear,
              slot.ethMonth
            );
            const key = ethiopianSlotKey(slot.ethYear, slot.ethMonth);
            return (
              <button
                key={key}
                type="button"
                title={slot.fullLabel}
                onClick={() =>
                  onChange({
                    kind: "ethiopian",
                    ethYear: slot.ethYear,
                    ethMonth: slot.ethMonth,
                  })
                }
                className={`rounded-t px-1 py-1 font-semibold tracking-wide underline decoration-2 underline-offset-4 sm:px-1.5 ${
                  isActive
                    ? "text-green-800 decoration-green-700"
                    : "text-gray-700 decoration-green-300/60"
                }`}
              >
                {slot.shortLabel}
                {isActive ? " ▾" : ""}
              </button>
            );
          })}
    </nav>
  );
}
