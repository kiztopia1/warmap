"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(
  () =>
    import("@/components/HomeClient").then((mod) => ({ default: mod.HomeClient })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen flex-col bg-[#e8e8e8] text-black">
        <div className="mx-auto min-h-screen w-full max-w-[1800px] flex-1 border-x border-gray-400 bg-white shadow-sm" />
      </div>
    ),
  }
);

export function HomeDynamic() {
  return <HomeClient />;
}
