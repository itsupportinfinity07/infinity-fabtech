"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

interface ProjectGalleryProps {
  images: string[];
  name: string;
}

export default function ProjectGallery({ images, name }: ProjectGalleryProps) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, prev, next]);

  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-brand-orange">Gallery</span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight mt-1">
            Project Gallery
          </h2>
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {images.length} photos
        </span>
      </div>

      {/* Grid: first image featured */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[140px] sm:auto-rows-[200px]">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Open photo ${i + 1} of ${name}`}
            className={`group relative overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
          >
            <Image
              src={src}
              alt={`${name} – photo ${i + 1}`}
              fill
              sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/30 transition-colors" />
            <span className="absolute bottom-3 right-3 p-2 rounded-lg bg-white/90 text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} gallery`}
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
          onClick={close}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-bold">
              {active + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex-1 mx-4 sm:mx-16 mb-4">
            <Image
              src={images[active]}
              alt={`${name} – photo ${active + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next photo"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Thumbnails */}
          <div className="flex justify-center gap-2 px-4 pb-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  i === active ? "border-brand-orange" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
