"use client";

import React from "react";
import { Hammer, Database, Settings } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

const iconMap = [Settings, Database, Hammer];

export default function ManufacturingExcellence() {
  const { landing: landingContent, company: companyConfig } = useSiteContent();
  const infra = companyConfig.infrastructure;
  const content = landingContent.manufacturingExcellence;

  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                {content.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue dark:text-white">
                {content.title}
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {infra.description}
            </p>
            <div className="space-y-4">
              {infra.sections.map((section, idx) => {
                const Icon = iconMap[idx] || Settings;
                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                        {section.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Graphical/Process Illustration */}
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-blue rounded-2xl transform translate-x-3 -translate-y-3 opacity-10 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-300" />
            <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-8 lg:p-10 shadow-lg">
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
                {content.qaTitle}
              </h3>

              <div className="space-y-5">
                {content.qaChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <span className="text-lg font-black text-slate-300">{item.step}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs">{item.label}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
