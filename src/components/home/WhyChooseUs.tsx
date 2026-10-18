"use client";

import React from "react";
import { Cpu, ShieldCheck, Users, Leaf, LucideIcon } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

const iconMap: Record<string, LucideIcon> = {
  Cpu,
  ShieldCheck,
  Users,
  Leaf,
};

export default function WhyChooseUs() {
  const { landing: landingContent, company: companyConfig } = useSiteContent();
  const content = landingContent.whyChooseUs;

  return (
    <section className="py-20 lg:py-28 bg-brand-gray text-stone-900 relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-[radial-gradient(circle_at_top_left,#b91c1c14,transparent)]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_bottom_right,#f9731620,transparent)]" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
            {content.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {content.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
            {content.description}
          </p>
        </div>

        {/* Why Choose Us Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {companyConfig.coreValues.map((value, idx) => {
            const Icon = iconMap[value.icon] || ShieldCheck;
            return (
              <div
                key={idx}
                className="flex flex-col p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-brand-orange/40 transition-all duration-300 group"
              >
                {/* Icon wrapper */}
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors mb-5">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-base font-bold text-stone-900 mb-3 group-hover:text-brand-orange transition-colors">
                  {value.title}
                </h3>

                <p className="text-sm text-stone-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

