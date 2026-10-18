"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

export default function CompanyOverview() {
  const { landing: landingContent, company: companyConfig } = useSiteContent();
  const content = landingContent.companyOverview;

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Media & Stats Grid */}
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-orange rounded-2xl transform translate-x-3 translate-y-3 opacity-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 lg:p-10 shadow-xl overflow-hidden">
              {/* Decorative graphic lines */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,#b91c1c20,transparent)]" />
              
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6 pb-4 border-b border-slate-800">
                {content.footprintTitle}
              </h3>

              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                {companyConfig.stats.map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-3xl lg:text-4xl font-black text-white leading-none">
                      {stat.value}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-400 font-bold uppercase tracking-wide">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
                {content.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Text Information */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                {content.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue dark:text-white leading-tight">
                {content.title}
              </h2>
            </div>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {companyConfig.history}
            </p>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Our Mission
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {companyConfig.mission}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Our Vision
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {companyConfig.vision}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-orange hover:text-brand-orange-light transition-colors group focus:outline-none"
              >
                {content.learnMoreLabel}
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

