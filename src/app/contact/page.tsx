import React from "react";
import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getContactPageSchema } from "@/lib/seo";
import ContactForm from "@/components/contact/ContactForm";
import { getPage } from "@/lib/content/site";

export const metadata: Metadata = constructMetadata({
  title: "Contact Our Sales Desk",
  description: "Get in touch with Infinity Fabtech Pvt. Ltd. for technical inquiries, price quotes, customized stamping drawings, and bulk order supply schedules.",
  slug: "contact",
});

export default async function ContactPage() {
  const [companyConfig, contactContent] = await Promise.all([getPage("company"), getPage("contact")]);
  const jsonLd = getContactPageSchema();
  const content = contactContent;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 pb-20">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <section className="relative bg-brand-dark text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
            {content.hero.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {content.hero.title}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            {content.hero.description}
          </p>
        </div>
      </section>

      {/* Main Grid: Form + Info details */}
      <section className="mt-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Right Column: Corporate Contacts & Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-brand-blue dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                {content.contacts.title}
              </h3>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">Corporate Plant Address</h4>
                    <p className="leading-relaxed">{companyConfig.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">Direct Call</h4>
                    <p className="font-semibold">{companyConfig.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">General & Sales Email</h4>
                    <p className="font-semibold">{companyConfig.email}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{companyConfig.salesEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">Operating Hours</h4>
                    <p className="leading-tight">{companyConfig.operatingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Direct CTA Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 lg:p-8 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">{content.whatsapp.title}</h4>
              </div>
              <p className="text-xs text-slate-100 leading-relaxed">
                {content.whatsapp.description}
              </p>
              <div>
                <a
                  href={`https://wa.me/${companyConfig.whatsappNumber}?text=${encodeURIComponent(
                    companyConfig.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white text-emerald-700 hover:bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm focus:outline-none"
                >
                  {content.whatsapp.buttonLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-2">
          <iframe
            title="Infinity Fabtech Pvt. Ltd. Office Location"
            src={companyConfig.googleMapsEmbedUrl}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-xl filter grayscale dark:invert dark:opacity-80"
          />
        </div>
      </section>
    </div>
  );
}

