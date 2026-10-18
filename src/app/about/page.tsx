import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import {
  Cpu,
  ShieldCheck,
  Users,
  Leaf,
  LucideIcon,
  Award,
  CheckSquare,
  Factory,
  Zap,
  ArrowRight,
  Building2,
  Recycle,
  Target,
  Eye,
} from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getPage } from "@/lib/content/site";

export const metadata: Metadata = constructMetadata({
  title: "About Our Infrastructure & Values",
  description:
    "Learn about Infinity Fabtech Pvt. Ltd. — a leading PEB manufacturer in India. Our 65,000 sq.ft. factory, 500+ completed projects, engineering standards, and 11+ years of building excellence.",
  slug: "about",
});

const iconMap: Record<string, LucideIcon> = {
  Cpu,
  ShieldCheck,
  Users,
  Leaf,
  Award,
  CheckSquare,
  Factory,
  Zap,
  Building2,
  Recycle,
};

const processIconMap: Record<number, LucideIcon> = {
  0: Target,
  1: Cpu,
  2: Factory,
  3: Zap,
  4: Building2,
  5: ShieldCheck,
};

const standardShortNames: Record<number, string> = {
  0: "MBMA",
  1: "AISC",
  2: "AISI",
  3: "IS-800",
  4: "IS-875",
  5: "IS-1893",
  6: "IS:801",
};

export default async function AboutPage() {
  const [companyConfig, aboutContent] = await Promise.all([getPage("company"), getPage("about")]);
  const infra = companyConfig.infrastructure;
  const content = aboutContent;

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      {/* ── Hero Banner ── */}
      <section className="relative bg-brand-dark text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark/95 to-brand-blue/30" />
        {/* Decorative arc */}
        <div className="absolute -bottom-1 left-0 right-0 h-16 bg-slate-50 dark:bg-slate-950 [clip-path:ellipse(55%_100%_at_50%_100%)]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-5">
              <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-3 py-1.5 rounded-full">
                {content.hero.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {content.hero.title}
              </h1>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                {content.hero.description}
              </p>
            </div>

            {/* Stat pills in hero */}
            <div className="grid grid-cols-2 gap-4">
              {companyConfig.stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 space-y-1"
                >
                  <p className="text-2xl lg:text-3xl font-black text-white leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Company Story ── */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left: Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
                  {content.journey.title}
                </span>
                <div className="h-0.5 w-12 bg-brand-orange rounded-full" />
              </div>

              {content.journey.paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                >
                  {para}
                </p>
              ))}

              {/* Quote callout */}
              <blockquote className="mt-6 border-l-4 border-brand-orange pl-5 py-1">
                <p className="text-sm italic text-slate-500 dark:text-slate-400 leading-relaxed">
                  &ldquo;Listen. Plan. Build Better — we build trust since 2008.&rdquo;
                </p>
              </blockquote>
            </div>

            {/* Right: Mission & Vision */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                {/* Mission */}
                <div className="p-6 bg-brand-blue text-white space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-orange">
                      Our Mission
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {companyConfig.mission}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-brand-orange via-brand-orange/50 to-transparent" />

                {/* Vision */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4 text-brand-orange" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-orange">
                      Our Vision
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {companyConfig.vision}
                  </p>
                </div>
              </div>

              {/* Trust badge */}
              <div className="rounded-2xl bg-brand-orange/5 border border-brand-orange/15 p-5 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="h-4 w-4 text-brand-orange" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {companyConfig.reasonForTrust}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Leadership ── */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
              Our Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue dark:text-white leading-tight">
              The Visionaries Behind Infinity Fabtech
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Guided by rich experience, strong engineering ethics, and a commitment to delivering excellence.
            </p>
          </div>

          <div className="flex flex-col gap-12 lg:gap-16">
            {content.leadership.map((leader, i) => (
              <div
                key={i}
                className="group relative flex flex-col md:flex-row rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-brand-orange/5 hover:-translate-y-2 transition-all duration-300 md:min-h-[420px]"
              >
                {/* Vertical Portrait Image Container */}
                <div className="relative w-full md:w-[32%] aspect-[3/4] md:aspect-auto min-h-[350px] md:min-h-full overflow-hidden bg-slate-200 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                  <Image
                    src={leader.src}
                    alt={leader.name}
                    fill
                    sizes="(max-w-768px) 100vw, (max-w-1200px) 30vw, 400px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
                </div>

                {/* Content Block */}
                <div className="p-10 lg:p-12 flex-1 flex flex-col justify-center space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4 gap-3">
                      <h3 className="text-2xl lg:text-3xl font-black text-brand-blue dark:text-white group-hover:text-brand-orange transition-colors duration-300">
                        {leader.name}
                      </h3>
                      <span className="text-xs font-black uppercase tracking-widest text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-4 py-1.5 rounded-full w-fit flex-shrink-0">
                        {leader.role}
                      </span>
                    </div>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                      {leader.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {content.awards.some((img) => img.src) && (
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
              Media Gallery
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-blue dark:text-white">
              Moments & Celebrations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.awards.filter((img) => img.src).map((img, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 aspect-[4/3]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Core Values ── */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
              {content.values.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-blue dark:text-white">
              {content.values.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyConfig.coreValues.map((value, idx) => {
              const Icon = iconMap[value.icon] || ShieldCheck;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:border-brand-orange/30 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Subtle number watermark */}
                  <span className="absolute top-4 right-4 text-5xl font-black text-slate-100 dark:text-slate-800 select-none leading-none">
                    0{idx + 1}
                  </span>

                  <div className="relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="relative text-sm font-bold text-slate-800 dark:text-white mb-2 leading-snug">
                    {value.title}
                  </h3>
                  <p className="relative text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Manufacturing Infrastructure ── */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left: Text Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
                  Manufacturing Unit
                </span>
                <div className="h-0.5 w-12 bg-brand-orange rounded-full" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue dark:text-white leading-tight">
                65,000 Sq.Ft. State-of-the-Art Plant
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                IFTPL has a state-of-art 65,000 sq. ft. Manufacturing facility in Bajrang paliya, Indore (M.P.) The plant is fully kitted out with the latest machinery – CNC plasma proﬁle Cutting machines, EOT Cranes, Beam line, 30 M. Ton Un-coiler and straighteners, Separate two assembly and production line, C & Z purlin, Sheeting Machines, Curve Proﬁle machines, 10+ ﬁtting stations etc…
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                IFTPL used sophisticated nesting software, cut to length web and ﬂange by using a de-coiler, software based material planning help in to achieve intermediate joint free fabrication production, reduce production cost with highest accuracy and speed. The ﬂange and web plate are welded to form of I section in our advanced automatic sub arc continuous H beam welding station. The built-up beam further joint with the connection plate, stiffeners, clip and other accessory as per the shop ﬂoor production drawing and are welded with MIG metal core weld electrode. The fabricated section undergoes a short blasting process as per SA-2.5 standards, to remove mill scale, moisture, rust particle, oil and grease to prepare the surface for painting to achieve batter bond between metal surfaces and paint coat. one coat of primer plus two coats of enamel or epoxy ﬁnish paint is applied by air less strain less painting machine for appropriate DFT Value.
              </p>

              {/* Quick info badges */}
              <div className="pt-2 flex flex-wrap gap-2">
                {content.equipmentTags.map((eq) => (
                  <span
                    key={eq}
                    className="text-[9px] font-bold uppercase tracking-wide text-brand-blue dark:text-brand-steel bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/15 dark:border-brand-blue/20 px-2.5 py-1 rounded-full"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: 2x2 Image Grid Gallery */}
            {content.factoryImages.some((img) => img.src) && (
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              {content.factoryImages.filter((img) => img.src).map((img, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-sm hover:shadow-md transition-all duration-300 aspect-[4/3]"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-w-768px) 50vw, 250px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
            )}

          </div>
        </div>
      </section>

      {/* ── Project Lifecycle ── */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
              {content.process.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-blue dark:text-white">
              {content.process.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {content.process.description}
            </p>
          </div>

          {/* Timeline grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.process.steps.map((proc, idx) => {
              const StepIcon = processIconMap[idx] || CheckSquare;
              const isLast = idx === content.process.steps.length - 1;
              return (
                <div
                  key={idx}
                  className={`relative p-6 rounded-2xl border transition-all ${
                    isLast
                      ? "bg-brand-blue border-brand-blue text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 hover:border-brand-orange/30 hover:shadow-sm"
                  }`}
                >
                  {/* Step connector dot (desktop) */}
                  <div
                    className={`inline-flex items-center justify-center h-9 w-9 rounded-xl mb-4 ${
                      isLast
                        ? "bg-white/15 text-white"
                        : "bg-brand-orange/10 text-brand-orange"
                    }`}
                  >
                    <StepIcon className="h-4.5 w-4.5" />
                  </div>

                  <span
                    className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${
                      isLast ? "text-white/60" : "text-brand-orange"
                    }`}
                  >
                    Step {proc.step}
                  </span>
                  <h4
                    className={`text-sm font-bold mb-2 ${
                      isLast ? "text-white" : "text-slate-800 dark:text-white"
                    }`}
                  >
                    {proc.label}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed ${
                      isLast
                        ? "text-white/70"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {proc.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Engineering Standards & Quality ── */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
                  Quality & Compliance
                </span>
                <div className="h-0.5 w-12 bg-brand-orange rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-blue dark:text-white">
                {content.quality.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {content.quality.description}
              </p>

              {/* Quality commitment highlight */}
              <div className="mt-4 rounded-2xl bg-brand-orange/5 border border-brand-orange/20 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-brand-orange flex-shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-brand-orange">
                    Built to Last
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every building is engineered, designed, and constructed in accordance with Indian
                  standards for applicable load — ensuring structural safety, durability, and
                  long-term performance.
                </p>
              </div>
            </div>

            {/* Standards cards — right column */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.quality.standards.map((std, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-brand-orange/25 hover:shadow-sm transition-all group"
                  >
                    {/* Badge */}
                    <div className="flex-shrink-0 h-10 w-14 rounded-xl bg-brand-blue flex items-center justify-center group-hover:bg-brand-orange transition-colors">
                      <span className="text-[9px] font-black text-white uppercase tracking-tight leading-tight text-center px-1">
                        {standardShortNames[i]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">
                      {std.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Go Green ── */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-emerald-950 to-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-4 py-1.5">
                <Recycle className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  {content.goGreen.badge}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {content.goGreen.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {content.goGreen.description}
              </p>

              {/* Big stat */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-5xl font-black text-emerald-400">98%</span>
                <span className="text-sm text-slate-400 leading-snug max-w-[180px]">
                  Steel — recyclable up to 90%
                </span>
              </div>
            </div>

            {/* Right: bullet points */}
            <div className="lg:col-span-7">
              <ul className="space-y-4">
                {content.goGreen.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors"
                  >
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
