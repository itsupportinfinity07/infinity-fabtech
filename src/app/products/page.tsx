import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import ProductCardActions from "@/components/products/ProductCardActions";
import { getProducts } from "@/lib/content/site";

export const metadata: Metadata = constructMetadata({
  title: "Industrial Roofing Components Catalog",
  description: "Browse standing seam roof clips, polyolefin closer strips, insulation materials, self-drilling screws, and custom PEB fasteners.",
  slug: "products",
});

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <section className="relative bg-brand-dark text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
            Product Portfolio
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Industrial Roofing Catalog
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            High-integrity metallic and polymer accessories for Pre-Engineered Buildings, warehouses, and steel structures.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mt-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod) => (
            <div
              key={prod.slug}
              className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <Link href={`/products/${prod.slug}`} className="relative block h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 focus:outline-none">
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-blue/80 dark:bg-slate-950/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                  <Tag className="h-3 w-3 text-brand-orange" />
                  {prod.category}
                </span>
              </Link>

              {/* Minimal content */}
              <div className="p-5 flex flex-col grow">
                <Link href={`/products/${prod.slug}`} className="focus:outline-none">
                  <h3 className="text-sm font-bold text-brand-blue dark:text-white leading-snug group-hover:text-brand-orange transition-colors line-clamp-2">
                    {prod.name}
                  </h3>
                </Link>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-3">
                  <Link
                    href={`/products/${prod.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-brand-orange transition-colors focus:outline-none"
                  >
                    Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <ProductCardActions slug={prod.slug} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
