import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Box, MousePointerClick, Layers, Ruler, ArrowRight } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import FrameExplorer3D from "@/components/frames3d/FrameExplorer3D";

export const metadata: Metadata = constructMetadata({
  title: "Interactive 3D PEB Frame Models",
  description:
    "Explore all 8 pre-engineered building frame types as interactive 3D models — clear span, multi span MS-2/MS-3, mono slope, crane and mezzanine frames and RCC column systems. Orbit, explode and configure every dimension.",
  slug: "3d-models",
});

const HIGHLIGHTS = [
  {
    icon: Box,
    title: "8 Complete Frame Types",
    text: "Clear span, multi span MS-2 and MS-3, mono slope, crane & mezzanine, and RCC column systems — modelled to real PEB proportions.",
  },
  {
    icon: Ruler,
    title: "Live Parametric Geometry",
    text: "Change width, eave height, roof pitch, span count and bay count — the whole building rebuilds instantly with updated ridge height and floor area.",
  },
  {
    icon: Layers,
    title: "X-Ray & Exploded Views",
    text: "Peel the cladding away, isolate the primary frame, or explode the model layer by layer to see how sheeting, purlins and steel stack up.",
  },
  {
    icon: MousePointerClick,
    title: "Click Any Member",
    text: "Select a column, rafter, purlin, gutter or crane rail to see what it does and exactly which Infinity Fabtech fasteners and closers it needs.",
  },
];

export default function ThreeDModelsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 text-stone-900 lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute -mr-12 -mt-12 right-0 top-0 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-brand-orange">
            <Box className="h-3.5 w-3.5" /> Interactive 3D Engineering Models
          </span>
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-none tracking-tight sm:text-5xl lg:text-6xl">
            All 8 PEB Frame Types — In 3D
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-stone-600 sm:text-lg">
            A full pre-engineered building you can orbit, section and take apart. Configure the
            frame the way your site needs it, then see every structural member and the products
            that go with it.
          </p>
        </div>
      </section>

      {/* The explorer */}
      <FrameExplorer3D showHeader={false} />

      {/* What you can do */}
      <section className="border-t border-stone-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-stone-900 sm:text-3xl">
            What you can do with the model
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-stone-200 bg-brand-gray p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-orange/10 p-2.5 text-brand-orange">
                  <h.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-sm font-bold text-stone-900">{h.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{h.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-brand-gray p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Found the frame that fits your project?
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                Send us the configuration and our engineers will come back with a detailed
                fastener and closer schedule.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex flex-none items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-orange/25 transition-colors hover:bg-brand-orange-light"
            >
              Request a Quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
