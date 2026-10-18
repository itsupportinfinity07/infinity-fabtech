"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

export default function TestimonialsSection() {
  const { landing: landingContent, testimonials } = useSiteContent();
  const content = landingContent.testimonials;

  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
            {content.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue dark:text-white leading-tight">
            {content.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            {content.description}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="relative p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Decorative Quote Icon */}
              <Quote className="absolute top-6 right-8 h-10 w-10 text-slate-100 dark:text-slate-800/80 pointer-events-none" />

              <div className="space-y-4">
                {/* Rating stars */}
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-current" />
                  ))}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;{test.feedback}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white font-black text-sm uppercase">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                    {test.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium leading-none">
                    {test.role}, <span className="text-brand-orange">{test.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

