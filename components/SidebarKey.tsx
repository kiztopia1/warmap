const KEY_ROWS: { swatch: string; label: string }[] = [
  { swatch: "bg-sheet-accent", label: "" },
  { swatch: "bg-key-pink", label: "" },
  { swatch: "bg-key-blue", label: "" },
  ...Array.from({ length: 9 }, () => ({ swatch: "bg-panel", label: "" })),
];

export function SidebarKey() {
  return (
    <aside className="flex min-w-[7rem] max-w-[11rem] flex-1 flex-col border-l border-border-strong bg-panel md:min-w-[9rem]">
      <div className="bg-header-bar-bg py-1.5 text-center text-xs font-bold text-header-bar-fg">
        Key
      </div>
      <div className="flex flex-1 flex-col">
        {KEY_ROWS.map((row, i) => (
          <div
            key={i}
            className="grid min-h-[28px] flex-1 grid-cols-[2.25rem_1fr] border-b border-border-strong last:border-b-0"
          >
            <div
              className={`border-r border-border-strong ${row.swatch}`}
              aria-hidden
            />
            <div className="bg-panel" />
          </div>
        ))}
      </div>
    </aside>
  );
}
