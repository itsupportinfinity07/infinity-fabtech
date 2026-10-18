import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getJobs } from "@/lib/content";
import { getPage } from "@/lib/content/site";

export const metadata: Metadata = constructMetadata({
  title: "Careers at Infinity Fabtech",
  description:
    "Join Infinity Fabtech Pvt. Ltd. — explore openings in PEB design, detailing, project execution and sales.",
  slug: "careers",
});


export default async function CareersPage() {
  const [careersContent, companyConfig] = await Promise.all([getPage("careers"), getPage("company")]);
  const content = careersContent;
  const openings = await getJobs();
  const applyHref = (role: string) =>
    `mailto:${companyConfig.email}?subject=${encodeURIComponent(`Application: ${role}`)}`;

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute -right-16 top-0 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
            {content.hero.badge}
          </span>
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            {content.hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-stone-600">
            {content.hero.description}
          </p>
          <a
            href="#openings"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-orange/25 transition-colors hover:bg-brand-orange-light"
          >
            View open positions <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Why join */}
      <section className="border-y border-stone-200 bg-brand-gray py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-2xl font-bold text-stone-900 sm:text-3xl">Why work with us</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.perks.map((perk) => (
              <div
                key={perk.title}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-orange/10 p-2.5 text-brand-orange">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-sm font-bold text-stone-900">{perk.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{perk.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section id="openings" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-2xl font-bold text-stone-900 sm:text-3xl">Open positions</h2>
          <p className="mb-8 text-sm text-stone-600">
            Open a role to read the full job description and apply.
          </p>
          <div className="space-y-4">
            {openings.length === 0 && (
              <div className="rounded-2xl border border-stone-200 bg-brand-gray p-8 text-center text-sm text-stone-600">
                There are no open positions right now. Send us your resume below and we will keep it on file.
              </div>
            )}
            {openings.map((job) => (
              <div
                key={job.title}
                className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-brand-orange/40 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                    {job.department}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900">
                    <Link href={`/careers/${job.slug}`} className="hover:text-brand-orange">
                      {job.title}
                    </Link>
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-stone-600">{job.summary}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1 text-xs text-stone-600">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-orange" /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-brand-orange" /> {job.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {job.experience && <><Clock className="h-3.5 w-3.5 text-brand-orange" /> {job.experience}</>}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/careers/${job.slug}`}
                  className="inline-flex flex-none items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-orange-light"
                >
                  View details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-brand-gray p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Don&apos;t see a fit?</h3>
              <p className="mt-1 text-sm text-stone-600">
                Send us your resume and we will keep it on file for future openings.
              </p>
            </div>
            <a
              href={applyHref("General Application")}
              className="inline-flex flex-none items-center gap-2 rounded-xl border border-brand-orange px-6 py-3 text-sm font-bold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
            >
              <Mail className="h-4 w-4" /> Send your resume
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
