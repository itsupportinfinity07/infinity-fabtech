"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Award, CheckCircle2, LucideIcon } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

const iconMap: Record<string, LucideIcon> = {
  Award,
  CheckCircle2,
  Shield,
};

export default function Hero() {
  const { landing: landingContent } = useSiteContent();
  const content = landingContent.hero;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-700 -mt-16 lg:-mt-20">
      {/* Background image: shown at near-full brightness; scrims only where text/nav need contrast */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-125 saturate-110 z-0 scale-105 transform transition-transform duration-[10s]"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      />
      {/* Left scrim behind the copy, fading out to reveal the photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/45 to-transparent z-0" />
      {/* Soft top scrim so the transparent navbar stays legible */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stone-900/70 to-transparent z-0" />
      {/* Warm brand glow for a lighter, more inviting feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(251,146,60,0.28),transparent_60%)] z-0" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stone-900/40 to-transparent z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Trust Badge */}
          {content.trustBadge && (
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-brand-orange/40 text-brand-orange shadow-sm text-xs font-bold uppercase tracking-wider mb-6"
            >
              <Shield className="h-3.5 w-3.5" />
              {content.trustBadge}
            </motion.div>
          )}

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6"
          >
            {content.headline.part1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500">
              {content.headline.part2}
            </span>{" "}
            {content.headline.part3}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] leading-relaxed mb-8 max-w-2xl"
          >
            {content.description}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
            <Link
              href="/contact"
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light px-7 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {content.primaryCta}
              <ArrowRight className="h-4.5 w-4.5 animate-pulse" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/50 hover:border-white/80 px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all"
            >
              {content.secondaryCta}
            </Link>
          </motion.div>

          {/* Trust Highlights Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/25 pt-8"
          >
            {content.highlights.map((highlight, idx) => {
              const icons = ["Award", "CheckCircle2", "Shield"];
              const TargetIcon = iconMap[icons[idx]] || Shield;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/90 p-2 text-brand-orange shadow-sm">
                    <TargetIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white leading-none">{highlight.value}</p>
                    <p className="text-xs text-white/80 mt-1 font-medium">{highlight.label}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

