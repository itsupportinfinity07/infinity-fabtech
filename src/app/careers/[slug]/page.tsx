import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Clock, Mail } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getJob, getJobs } from "@/lib/content";
import { getPage } from "@/lib/content/site";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getJobs()).map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  return constructMetadata({
    title: `${job.title} – Careers`,
    description: job.summary,
    slug: `careers/${job.slug}`,
  });
}

export default async function JobDetailPage({ params }: JobPageProps) {
  const companyConfig = await getPage("company");
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  const others = (await getJobs()).filter((j) => j.slug !== job.slug);
  const applyHref = `mailto:${companyConfig.email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [job.summary, ...job.responsibilities, ...job.requirements].join(" "),
    datePosted: job.postedAt ? job.postedAt.slice(0, 10) : undefined,
    validThrough: job.closesAt || undefined,
    employmentType: job.type.toUpperCase().replace("-", "_"),
    hiringOrganization: { "@type": "Organization", name: "Infinity Fabtech Pvt. Ltd.", sameAs: "https://www.infinityfabtech.com" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "IN" } },
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="relative overflow-hidden py-14 lg:py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute -right-16 top-0 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/careers#openings"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 transition-colors hover:text-brand-orange"
          >
            <ArrowLeft className="h-4 w-4" /> All openings
          </Link>
          <span className="block text-xs font-black uppercase tracking-widest text-brand-orange">
            {job.department}
          </span>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-4xl">
            {job.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-orange" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-brand-orange" /> {job.type}
            </span>
            {job.experience && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-orange" /> {job.experience}
              </span>
            )}
          </div>
          <a
            href={applyHref}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-orange px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-orange/25 transition-colors hover:bg-brand-orange-light"
          >
            Apply for this role <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-brand-gray py-12">
        <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-stone-900">About the role</h2>
            <p className="text-sm leading-relaxed text-stone-600">{job.summary}</p>
          </div>
          {[
            { title: "Key responsibilities", items: job.responsibilities },
            { title: "Requirements", items: job.requirements },
          ].map((block) => (
            <div key={block.title} className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-stone-900">{block.title}</h2>
              <ul className="space-y-2.5">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-stone-600">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-orange" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-orange/30 bg-white p-7 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Interested in this role?</h3>
              <p className="mt-1 text-sm text-stone-600">
                Email your resume to {companyConfig.email} with the role in the subject line.
              </p>
            </div>
            <a
              href={applyHref}
              className="inline-flex flex-none items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-orange-light"
            >
              <Mail className="h-4 w-4" /> Apply now
            </a>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-stone-900">Other open positions</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/careers/${o.slug}`}
                  className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-lg"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                    {o.department}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-stone-900 group-hover:text-brand-orange">
                    {o.title}
                  </h3>
                  <p className="mt-1 text-xs text-stone-600">
                    {[o.location, o.type, o.experience].filter(Boolean).join(" · ")}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                    View details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
