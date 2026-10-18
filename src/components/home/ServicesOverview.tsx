"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, CheckSquare, Truck, Wrench, Building2, LucideIcon } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

const iconMap: Record<string, LucideIcon> = {
  Compass,
  CheckSquare,
  Truck,
  Wrench,
  Building2,
};

export default function ServicesOverview() {
  const { landing: landingContent, services } = useSiteContent();
  const content = landingContent.servicesOverview;

  return (
    <section className="py-20 lg:py-28 bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600">
              {content.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue">
              {content.title}
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 mt-4 md:mt-0 text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-brand-orange transition-colors group focus:outline-none shrink-0"
          >
            {content.exploreLabel}
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 3).map((service) => {
            const Icon = iconMap[service.iconName] || Wrench;
            return (
              <div
                key={service.id}
                className="relative overflow-hidden flex flex-col justify-between p-8 rounded-3xl bg-white border border-slate-200/50 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.04)] hover:shadow-[0_30px_60px_-15px_rgba(242,100,25,0.08)] hover:-translate-y-1.5 transition-all duration-300 group"
              >
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange to-brand-orange-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-4">
                  {/* Icon Box */}
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-orange transition-colors duration-300">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {service.description}
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {content.consultationLabel}
                  </span>
                  <Link
                    href="/services"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-brand-orange hover:text-brand-orange-light transition-colors focus:outline-none"
                  >
                    {content.viewBenefitsLabel}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

