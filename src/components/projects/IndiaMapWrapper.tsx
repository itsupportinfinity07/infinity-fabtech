"use client";

import dynamic from "next/dynamic";
import type { MapLocation } from "@/lib/map-types";

const IndiaClientMap = dynamic(() => import("./IndiaClientMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] sm:h-[560px] lg:h-[640px] rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center">
      <p className="text-sm text-slate-400 font-medium">Loading India map…</p>
    </div>
  ),
});

export default function IndiaMapWrapper({ locations }: { locations: MapLocation[] }) {
  return <IndiaClientMap locations={locations} />;
}
