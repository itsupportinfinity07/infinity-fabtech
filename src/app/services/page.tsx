import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Compass, CheckSquare, Truck, Wrench, Building2, ArrowRight, Check, LucideIcon } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getPage, getServices } from "@/lib/content/site";

export const metadata: Metadata = constructMetadata({
  title: "Roofing Consultation & Supply Services",
  description: "Read about our roofing site audits, tailored material recommendations, high-volume supply, and PEB engineering project assistance.",
  slug: "services",
});

const iconMap: Record<string, LucideIcon> = {
  Compass,
  CheckSquare,
  Truck,
  Wrench,
  Building2,
};

export default async function ServicesPage() {
  const [servicesPageContent, services] = await Promise.all([getPage("servicesPage"), getServices()]);
  const content = servicesPageContent;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <section className="relative bg-brand-dark text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
            {content.hero.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {content.hero.title}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            {content.hero.description}
          </p>
        </div>
      </section>

      {/* Services Grid — 2 per row */}
      <section className="mt-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {services.map((service) => {
            const Icon = iconMap[service.iconName] || Wrench;

            return (
              <div
                key={service.id}
                className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] hover:-translate-y-0.5"
              >
                {/* Top accent — thin orange line */}
                <div className="h-[3px] w-full bg-gradient-to-r from-brand-orange via-brand-orange-light to-brand-orange/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-7 sm:p-8 flex flex-col flex-1">
                  {/* Icon + Title row */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-brand-orange/8 border border-brand-orange/15 flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-300">
                      <Icon className="h-6 w-6 text-brand-orange group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-brand-blue dark:text-white leading-tight">
                        {service.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Benefits — clean vertical list */}
                  <ul className="space-y-2.5 mt-2 flex-1">
                    {service.benefits.map((ben, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                        <span className="leading-snug">{ben}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bottom CTA */}
                  <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange hover:text-brand-orange-light transition-colors group/btn"
                    >
                      Get Consultation
                      <ArrowRight className="h-3.5 w-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Corporate Callout Block */}
      <section className="mt-16 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-8 lg:p-12 shadow-xs">
        <h3 className="text-xl font-black text-brand-blue dark:text-white uppercase tracking-wider mb-4">
          {content.callout.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-6">
          {content.callout.description}
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold uppercase tracking-wider px-6 py-3 shadow-md transition-colors focus:outline-none"
        >
          {content.callout.buttonLabel}
        </Link>
      </section>
    </div>
  );
}

