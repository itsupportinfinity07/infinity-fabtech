"use client";

import React from "react";
import { useQuote } from "@/context/QuoteContext";
import { MessageCircle } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

export default function ProductDetailsActions({ slug, name }: { slug: string; name: string }) {
  const { company: companyConfig } = useSiteContent();
  const { openQuote, setSelectedProduct } = useQuote();

  const handleInquiry = () => {
    setSelectedProduct(slug);
    openQuote();
  };

  const whatsappMessage = `Hello Infinity Fabtech Pvt. Ltd., I would like to request pricing for "${name}".`;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={handleInquiry}
        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white px-7 py-4 text-sm font-bold uppercase tracking-wider transition-colors shadow-md focus:outline-none"
      >
        Request pricing/Sample
      </button>
      
      <a
        href={`https://wa.me/${companyConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-4 text-sm font-bold uppercase tracking-wider transition-colors shadow-md focus:outline-none"
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp Sales
      </a>
    </div>
  );
}
