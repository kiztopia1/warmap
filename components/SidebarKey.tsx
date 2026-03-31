const KEY_ROWS: { swatch: string; label: string }[] = [
  { swatch: "bg-sheet-accent", label: "" },
  { swatch: "bg-key-pink", label: "" },
  { swatch: "bg-key-blue", label: "" },
  ...Array.from({ length: 9 }, () => ({ swatch: "bg-white", label: "" })),
];

export function SidebarKey() {
  return (
    <aside className="flex min-w-[7rem] max-w-[11rem] flex-1 flex-col border-l border-black bg-white md:min-w-[9rem]">
      <div className="bg-black py-1.5 text-center text-xs font-bold text-white">
        Key
      </div>
      <div className="flex flex-1 flex-col">
        {KEY_ROWS.map((row, i) => (
          <div
            key={i}
            className="grid min-h-[28px] flex-1 grid-cols-[2.25rem_1fr] border-b border-black last:border-b-0"
          >
            <div
              className={`border-r border-black ${row.swatch}`}
              aria-hidden
            />
            <div className="bg-white" />
          </div>
        ))}
      </div>
    </aside>
  );
}
