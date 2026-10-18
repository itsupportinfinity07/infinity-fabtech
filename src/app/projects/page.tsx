import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, SquareStack, ChevronRight, Briefcase } from "lucide-react";
import { getPage } from "@/lib/content/site";
import { getMapLocations, getProjects } from "@/lib/content";
import { descriptionToText } from "@/lib/richtext";
import { constructMetadata } from "@/lib/metadata";
import IndiaMapWrapper from "@/components/projects/IndiaMapWrapper";

export const metadata: Metadata = constructMetadata({
  title: "Completed PEB & Steel Projects",
  description: "Explore our portfolio of completed industrial warehouses, manufacturing foundry shops, commercial composite steel decks, and custom cold storage projects.",
  slug: "projects",
});

export default async function ProjectsPage() {
  const content = await getPage("projectsPage");
  const [projects, locations] = await Promise.all([getProjects(), getMapLocations()]);

  return (
    <div className="bg-[#f8fafc] pb-24">
      {/* Header Banner */}
      <section className="relative bg-brand-dark text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-brand-light-blue/20 rounded-full blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center lg:text-left">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-xs font-black uppercase tracking-widest text-brand-orange">
            {content.hero.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
            {content.hero.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-3xl leading-relaxed mx-auto lg:mx-0">
            {content.hero.description}
          </p>
        </div>
      </section>

      {/* Interactive India Map */}
      <section className="mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <IndiaMapWrapper locations={locations} />
      </section>

      {/* Projects Grid Section */}
      <section className="mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group overflow-hidden rounded-3xl bg-white border border-slate-200/50 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.04)] hover:shadow-[0_30px_60px_-15px_rgba(242,100,25,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              {/* Cover image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/95 text-brand-orange text-xs font-bold uppercase tracking-wider">
                  <Briefcase className="h-3 w-3" />
                  {project.type}
                </span>
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-xs text-white font-semibold">
                  <MapPin className="h-3.5 w-3.5 text-brand-orange" />
                  {project.location}
                </span>
              </div>

              {/* Project info */}
              <div className="p-6 sm:p-8 flex flex-col flex-1 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-brand-blue tracking-tight leading-tight group-hover:text-brand-orange transition-colors">
                    {project.name}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Client: {project.client}</p>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3">
                  {descriptionToText(project.description)}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 text-xs font-bold text-brand-blue">
                    <span className="flex items-center gap-1.5">
                      <SquareStack className="h-4 w-4 text-brand-orange/75" />
                      {project.area}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-brand-orange/75" />
                      {project.year}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-orange shrink-0">
                    View Details
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Corporate Callout Block */}
      <section className="mt-20 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center bg-white border border-slate-200/60 rounded-3xl p-10 lg:p-14 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-brand-orange/5 rounded-full blur-xl" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-light-blue/5 rounded-full blur-xl" />

        <h3 className="text-2xl font-black text-brand-blue tracking-tight mb-4">
          {content.callout.title}
        </h3>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
          {content.callout.description}
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold uppercase tracking-wider px-7 py-4 shadow-lg hover:shadow-xl hover:shadow-brand-orange/20 transition-all duration-200 focus:outline-none"
        >
          {content.callout.buttonLabel}
        </Link>
      </section>
    </div>
  );
}

