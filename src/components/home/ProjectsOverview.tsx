"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, SquareStack, ChevronRight, Briefcase } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

export interface OverviewProject {
  id: string; name: string; type: string; location: string; client: string; area: string; year: string; description: string;
}

export default function ProjectsOverview({ projects }: { projects: OverviewProject[] }) {
  const { landing: landingContent } = useSiteContent();
  const content = landingContent.projectsOverview;

  return (
    <section className="py-20 lg:py-28 bg-white">
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
            href="/projects"
            className="inline-flex items-center gap-2 mt-4 md:mt-0 text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-brand-orange transition-colors group focus:outline-none shrink-0"
          >
            {content.allBuildsLabel}
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-[#f8fafc] border border-slate-200/50 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.02)] hover:shadow-[0_30px_60px_-15px_rgba(242,100,25,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Visual Accent Top Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange to-brand-orange-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-5">
                {/* Header Metadata */}
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    <Briefcase className="h-2.5 w-2.5" />
                    {project.type}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {project.location.split(",")[0]}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-orange transition-colors duration-300">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-4">
                  {project.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <SquareStack className="h-4.5 w-4.5 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Area</p>
                      <p className="text-xs font-black text-slate-900 mt-1 leading-none">{project.area}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Completed</p>
                      <p className="text-xs font-black text-slate-900 mt-1 leading-none">{project.year}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-8 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Client: {project.client}
                </span>
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-brand-orange hover:text-brand-orange-light transition-colors focus:outline-none"
                >
                  {content.detailsLabel}
                  <ChevronRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

