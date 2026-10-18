"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Box, Layers, MousePointerClick, Ruler, RotateCw } from "lucide-react";
import FrameThumb from "@/components/frames3d/FrameThumb";
import { FRAME_TYPES } from "@/components/frames3d/frames";

const POINTS = [
  { icon: RotateCw, label: "Orbit & zoom the full building" },
  { icon: Layers, label: "X-ray and exploded layer views" },
  { icon: Ruler, label: "Live width, height, pitch & bays" },
  { icon: MousePointerClick, label: "Click a member to see its products" },
];

export default function Frames3DTeaser() {
  return (
    <section className="relative overflow-hidden bg-white py-20" id="frames-3d-teaser">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute -right-16 top-0 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-sm font-semibold text-brand-orange">
              <Box size={15} /> Interactive 3D Models
            </span>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
              Walk through all 8 PEB frame types in 3D
            </h2>
            <p className="mb-7 max-w-xl leading-relaxed text-stone-600">
              We built a full pre-engineered building you can spin, section and take apart in your
              browser. Set the width, eave height, pitch and bay count for your site, add a crane,
              mezzanine or skylights, then click any column, rafter or gutter to see exactly which
              Infinity Fabtech products it needs.
            </p>

            <ul className="mb-8 grid gap-3 sm:grid-cols-2">
              {POINTS.map((p) => (
                <li key={p.label} className="flex items-center gap-2.5 text-sm text-stone-700">
                  <span className="flex-none rounded-lg bg-brand-orange/15 p-1.5 text-brand-orange">
                    <p.icon className="h-4 w-4" />
                  </span>
                  {p.label}
                </li>
              ))}
            </ul>

            <Link
              href="/3d-models"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-orange/25 transition-colors hover:bg-brand-orange-light"
            >
              Open the 3D Frame Explorer <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <Link
              href="/3d-models"
              className="group block rounded-2xl border border-stone-200 bg-brand-gray p-5 shadow-sm transition-all hover:border-brand-orange/40 hover:shadow-lg"
            >
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-stone-500">
                8 frame types in the explorer
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {FRAME_TYPES.map((t) => (
                  <div
                    key={t.id}
                    className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5"
                  >
                    <FrameThumb type={t} height={52} />
                    <div className="bg-white px-2 pb-1.5">
                      <div className="truncate text-[10px] font-bold text-slate-700">{t.name}</div>
                      <div className="truncate text-[9px] text-stone-500">{t.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                Explore them in 3D
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </p>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
