"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CalendarTabMode } from "@/lib/calendar-2026";

type Props = {
  calendarTabMode: CalendarTabMode;
  gregorianPlannerYear: number;
  ethiopianYearRangeLabel: string;
  onSetCalendarTabMode: (mode: CalendarTabMode) => void;
};

export function DashboardCalendarMenu({
  calendarTabMode,
  gregorianPlannerYear,
  ethiopianYearRangeLabel,
  onSetCalendarTabMode,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="pointer-events-none fixed bottom-12 left-3 z-20 sm:bottom-14">
      <div className="pointer-events-auto relative flex flex-col items-start gap-1">
        {open ? (
          <div
            id={menuId}
            role="dialog"
            aria-label="Calendar display"
            className="mb-1 w-[min(18rem,calc(100vw-1.5rem))] rounded-lg border border-border-strong bg-menu-backdrop p-3 shadow-lg"
          >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
              Month tabs
            </p>
            <p className="mb-3 text-[10px] leading-snug text-neutral-600 dark:text-neutral-400">
              Day notes stay on Gregorian {gregorianPlannerYear} dates.{" "}
              <strong>Dashboard</strong> switches: Gregorian quarter months vs Ethiopian
              months (E.C.) with matching year-progress colors when the chip is on.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onSetCalendarTabMode("gregorian");
                  setOpen(false);
                }}
                className={`rounded border px-2 py-2 text-left text-xs font-semibold transition-colors ${
                  calendarTabMode === "gregorian"
                    ? "border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-100"
                    : "border-neutral-300 bg-panel text-neutral-800 hover:bg-neutral-50 dark:border-slate-500 dark:text-neutral-200 dark:hover:bg-slate-800/80"
                }`}
              >
                Gregorian ({gregorianPlannerYear})
              </button>
              <button
                type="button"
                onClick={() => {
                  onSetCalendarTabMode("ethiopian");
                  setOpen(false);
                }}
                className={`rounded border px-2 py-2 text-left text-xs font-semibold transition-colors ${
                  calendarTabMode === "ethiopian"
                    ? "border-green-700 bg-green-50 text-green-900 dark:border-green-600 dark:bg-green-950/40 dark:text-green-100"
                    : "border-neutral-300 bg-panel text-neutral-800 hover:bg-neutral-50 dark:border-slate-500 dark:text-neutral-200 dark:hover:bg-slate-800/80"
                }`}
              >
                Ethiopian ({ethiopianYearRangeLabel})
              </button>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((o) => !o)}
          title="Calendar type"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-chrome shadow-md hover:bg-panel"
        >
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="text-neutral-800 dark:text-neutral-200"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Open calendar type menu</span>
        </button>
      </div>
    </div>
  );
}
