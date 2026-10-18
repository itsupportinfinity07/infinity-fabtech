"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { useSiteContent } from "@/components/SiteContentProvider";

export default function FeaturedProducts() {
  const { products } = useSiteContent();
  const { openQuote, setSelectedProduct } = useQuote();

  const handleInquiry = (slug: string) => {
    setSelectedProduct(slug);
    openQuote();
  };

  return (
    <section className="py-20 lg:py-28 bg-[#f8fafc] border-y border-slate-200/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600">
              Our Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue">
              Steel Buildings, Structural & Storage Systems
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-4 md:mt-0 text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-brand-orange transition-colors group focus:outline-none shrink-0"
          >
            View Full Catalog
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 3).map((prod) => (
            <div
              key={prod.slug}
              className="relative overflow-hidden flex flex-col rounded-3xl bg-white border border-slate-200/50 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.04)] hover:shadow-[0_30px_60px_-15px_rgba(242,100,25,0.08)] hover:-translate-y-1.5 transition-all duration-300 group"
            >
              {/* Visual Accent Top Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange to-brand-orange-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              {/* Product Image */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-50">
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-blue/90 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                  <Tag className="h-3 w-3 text-white/80" />
                  {prod.category}
                </span>
              </div>

              {/* Product Details */}
              <div className="p-8 flex flex-col justify-between grow space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-orange transition-colors duration-300">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                    {prod.shortDescription}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                  <Link
                    href={`/products/${prod.slug}`}
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-brand-orange transition-colors focus:outline-none"
                  >
                    Tech Specs
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <button
                    onClick={() => handleInquiry(prod.slug)}
                    className="cursor-pointer inline-flex items-center rounded-xl bg-brand-orange hover:bg-brand-orange-light px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 focus:outline-none shadow-md hover:shadow-lg"
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
