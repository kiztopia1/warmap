import type { EthiopianMonthSlot } from "./ethiopian-2026";

export type EthiopianDashboardColumn =
  | { kind: "single"; slot: EthiopianMonthSlot }
  | {
      kind: "neh-pag";
      ethYear: number;
      slot12: EthiopianMonthSlot;
      pagSlot: EthiopianMonthSlot | null;
    }
  | { kind: "empty" };

const COLS_PER_ROW = 3;

function columnSortKey(c: EthiopianDashboardColumn): [number, number] {
  if (c.kind === "empty") return [99999, 99];
  if (c.kind === "single") return [c.slot.ethYear, c.slot.ethMonth];
  return [c.ethYear, 12];
}

/**
 * Ethiopian dashboard: three month columns per row, chronological order.
 * Pagumē is merged into Nehasé (same column); render uses a continuous grid (days 1–30 then 1–5/6).
 */
export function buildEthiopianDashboardRows(
  slots: EthiopianMonthSlot[]
): EthiopianDashboardColumn[][] {
  if (slots.length === 0) return [];

  const pagByYear = new Map<number, EthiopianMonthSlot>();
  for (const s of slots) {
    if (s.ethMonth === 13) pagByYear.set(s.ethYear, s);
  }

  const nonPag = slots.filter((s) => s.ethMonth !== 13);
  const sorted = [...nonPag].sort(
    (a, b) =>
      a.ethYear !== b.ethYear ? a.ethYear - b.ethYear : a.ethMonth - b.ethMonth
  );

  const cols: EthiopianDashboardColumn[] = [];
  const yearsWithNehPag = new Set<number>();

  for (const s of sorted) {
    if (s.ethMonth === 12) {
      yearsWithNehPag.add(s.ethYear);
      cols.push({
        kind: "neh-pag",
        ethYear: s.ethYear,
        slot12: s,
        pagSlot: pagByYear.get(s.ethYear) ?? null,
      });
    } else {
      cols.push({ kind: "single", slot: s });
    }
  }

  for (const [y, pag] of pagByYear) {
    if (!yearsWithNehPag.has(y)) {
      cols.push({ kind: "single", slot: pag });
    }
  }

  cols.sort((a, b) => {
    const ka = columnSortKey(a);
    const kb = columnSortKey(b);
    return ka[0] !== kb[0] ? ka[0] - kb[0] : ka[1] - kb[1];
  });

  const rows: EthiopianDashboardColumn[][] = [];
  for (let i = 0; i < cols.length; i += COLS_PER_ROW) {
    const slice = cols.slice(i, i + COLS_PER_ROW);
    const row: EthiopianDashboardColumn[] = [...slice];
    while (row.length < COLS_PER_ROW) row.push({ kind: "empty" });
    rows.push(row);
  }
  return rows;
}
