import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  MapPin,
  Wrench,
} from "lucide-react";
import { getProject, getProjects } from "@/lib/content";
import { descriptionToHtml, descriptionToText } from "@/lib/richtext";
import { constructMetadata } from "@/lib/metadata";
import ProjectGallery from "@/components/projects/ProjectGallery";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return {};

  return constructMetadata({
    title: project.seoTitle || project.name,
    description: project.seoDesc || descriptionToText(project.description).slice(0, 160),
    image: project.image,
    slug: `projects/${project.id}`,
  });
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const descriptionHtml = descriptionToHtml(project.description);

  return (
    <div className="bg-[#f8fafc] pb-24">
      {/* Hero with cover image */}
      <section className="relative bg-brand-dark text-white overflow-hidden">
        <Image
          src={project.image}
          alt={project.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/30" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-14 lg:pb-20 min-h-[380px] lg:min-h-[460px] flex flex-col justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-brand-orange transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            All Projects
          </Link>
          <div className="space-y-4 mt-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider">
              <Briefcase className="h-3.5 w-3.5" />
              {project.type}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl">
              {project.name}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-300 font-semibold">
              <MapPin className="h-4 w-4 text-brand-orange" />
              {project.location}
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div className="lg:col-span-8 space-y-12">
          {/* Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-brand-blue tracking-tight">Project Overview</h2>
            <div
              className="rich-content max-w-3xl"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-brand-blue tracking-tight">
              Highlights & Performance
            </h2>
            <ul className="space-y-3">
              {project.highlights.map((h, i) => (
                <li
                  key={i}
                  className="bg-white border border-slate-200/60 rounded-xl p-4 text-sm text-slate-600 flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scope */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-brand-blue tracking-tight">
              Engineering Scope Delivered
            </h2>
            <ul className="space-y-3">
              {project.scope.map((s, i) => (
                <li
                  key={i}
                  className="bg-white border border-slate-200/60 rounded-xl p-4 text-sm text-slate-600 flex items-start gap-3"
                >
                  <Wrench className="h-5 w-5 text-brand-orange/80 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-28">
          <div className="rounded-3xl bg-white border border-slate-200/60 p-6 shadow-[0_15px_30px_-10px_rgba(15,23,42,0.05)]">
            <h3 className="text-sm font-black uppercase tracking-widest text-brand-blue">Project Snapshot</h3>
            <dl className="mt-4 divide-y divide-slate-100">
              {[
                ["Type", project.type],
                ["Client", project.client],
                ["Location", project.location],
                ["Area", project.area],
                ["Completed", project.year],
              ].map(([k, v]) => (
                <div key={k} className="py-3 flex flex-col gap-0.5">
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{k}</dt>
                  <dd className="text-sm font-bold text-brand-blue leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

        </aside>
      </section>

      <ProjectGallery images={project.gallery} name={project.name} />

      {/* Next project */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        <Link
          href={`/projects/${next.id}`}
          className="group flex items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200/60 p-6 hover:border-brand-orange/40 transition-colors"
        >
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Project</p>
            <p className="text-lg font-black text-brand-blue group-hover:text-brand-orange transition-colors mt-1">
              {next.name}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-brand-orange group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      </section>
      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand-dark text-white px-7 py-10 sm:px-12 sm:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-orange/20 blur-3xl" />
          <div className="relative max-w-xl space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Planning a similar build?</h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Share your requirements with our engineering desk for a detailed quotation.
            </p>
          </div>
          <Link
            href="/contact"
            className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold uppercase tracking-wider px-8 py-4 transition-colors"
          >
            Request a Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
