import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag, HelpCircle, ShieldCheck } from "lucide-react";
import { getProduct, getProducts } from "@/lib/content/site";
import { constructMetadata } from "@/lib/metadata";
import { getProductSchema } from "@/lib/seo";
import ProductGallery from "@/components/products/ProductGallery";
import ProductDetailsActions from "@/components/products/ProductDetailsActions";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getProducts()).map((prod) => ({
    slug: prod.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  if (!product) return {};

  return constructMetadata({
    title: product.name,
    description: product.shortDescription,
    image: product.image,
    slug: `products/${product.slug}`,
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }


  const jsonLd = getProductSchema(product);

  return (
    <div className="bg-white pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back button header bar */}
      <div className="bg-[#f8fafc] border-b border-slate-200/50 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-orange transition-colors focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        {/* Core Layout: Full Screen Direct Grid (No Card Wrapper) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Product Gallery (Spans 6 cols on lg) */}
          <div className="lg:col-span-6 w-full">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Right Column: Key Details (Spans 6 cols on lg) */}
          <div className="lg:col-span-6 space-y-8 lg:pt-2">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-orange/5 text-xs font-bold text-brand-orange uppercase tracking-wider">
                <Tag className="h-3.5 w-3.5" />
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-blue tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
                {product.fullDescription.split(". ").slice(0, 2).join(". ") + "."}
              </p>
            </div>

            {/* Quick specifications bullets */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Key Parameters
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.specifications).slice(0, 4).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 hover:border-brand-orange/20 transition-all duration-200">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{key}</span>
                    <span className="text-sm font-bold text-brand-blue mt-1.5 block leading-tight">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Action triggers */}
            <div className="pt-6 border-t border-slate-100">
              <ProductDetailsActions slug={product.slug} name={product.name} />
            </div>
          </div>
        </div>

        {/* Dynamic Compact Details checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 pt-12 border-t border-slate-100">
          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/40 flex items-start gap-4 hover:border-brand-orange/20 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-brand-orange/5 text-brand-orange flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wide">Quality Assured</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Certified premium materials complying with global building codes and ISO fabrication standards.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/40 flex items-start gap-4 hover:border-brand-orange/20 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-brand-orange/5 text-brand-orange flex items-center justify-center shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wide">Support Desk</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Our engineering team provides quick material estimates and drawing reviews within 24 hours.
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
