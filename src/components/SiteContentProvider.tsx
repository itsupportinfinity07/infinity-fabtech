"use client";
import React, { createContext, useContext } from "react";
import type { SiteContext } from "@/lib/content/site";

const Ctx = createContext<SiteContext | null>(null);

export function SiteContentProvider({ value, children }: { value: SiteContext; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Site-wide content (landing copy, company details, footer, products, services, testimonials) for client components. */
export function useSiteContent() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSiteContent must be used inside SiteContentProvider");
  return v;
}
