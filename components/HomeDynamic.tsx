"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(
  () =>
    import("@/components/HomeClient").then((mod) => ({ default: mod.HomeClient })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen flex-col bg-page-canvas text-foreground">
        <div className="mx-auto min-h-screen w-full max-w-[1800px] flex-1 border-x border-neutral-400 bg-panel shadow-sm dark:border-slate-600" />
      </div>
    ),
  }
);

export function HomeDynamic() {
  return <HomeClient />;
}
