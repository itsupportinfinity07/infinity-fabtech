import React, { Suspense } from "react";
import { Metadata } from "next";
import { Phone, Mail, Clock, ShieldCheck, FileText, Search, Send } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import QuoteForm from "@/components/quote/QuoteForm";
import { getPage } from "@/lib/content/site";

export const metadata: Metadata = constructMetadata({
  title: "Request a Quote",
  description:
    "Submit your project requirements to Infinity Fabtech Pvt. Ltd. for a detailed quotation covering design, fabrication and erection of Pre-Engineered Steel Buildings.",
  slug: "request-quote",
});

const steps = [
  { icon: Send, title: "Submit your enquiry", text: "Share your project details and requirements using the form." },
  { icon: Search, title: "Technical review", text: "Our engineering desk reviews span, loads and site conditions." },
  { icon: FileText, title: "Detailed quotation", text: "You receive an itemised quotation within 24 working hours." },
];

export default async function RequestQuotePage() {
  const companyConfig = await getPage("company");
  return (
    <div className="bg-slate-50 pb-24">
      {/* Header */}
      <section className="relative bg-brand-dark text-white py-14 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-brand-orange">Quotation</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Request a Quote
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Provide your project requirements and our engineering team will respond with a detailed,
            customised quotation within 24 working hours.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Form */}
        <div className="lg:col-span-8">
          <Suspense fallback={null}>
            <QuoteForm />
          </Suspense>
        </div>

        {/* Info panel */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          <div className="rounded-xl bg-white border border-slate-200 p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-brand-blue">What happens next</h2>
            <ol className="mt-5 space-y-5">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-orange">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {i + 1}. {title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl bg-brand-dark text-white p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Prefer to talk?</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-orange shrink-0" />
                <a href={`tel:${companyConfig.phoneFormatted}`} className="hover:text-brand-orange transition-colors">
                  {companyConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-orange shrink-0" />
                <a href={`mailto:${companyConfig.email}`} className="hover:text-brand-orange transition-colors break-all">
                  {companyConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                <span className="text-slate-300">{companyConfig.operatingHours}</span>
              </li>
            </ul>
            <p className="flex items-start gap-2 pt-4 border-t border-white/10 text-xs text-slate-400 leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              Your information is used only to prepare your quotation and is never shared with third parties.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
