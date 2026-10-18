"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

export default function Footer() {
  const { company: companyConfig, products, footer: footerContent } = useSiteContent();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const content = footerContent;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      // Mock newsletter signup
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-brand-gray text-slate-600 border-t border-slate-200 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <Link href="/" className="flex flex-col items-start focus:outline-none">
              <span className="text-xl font-black tracking-tight text-brand-blue uppercase leading-none">
                Infinity Fabtech
              </span>
              <span className="text-[9px] font-bold tracking-widest text-brand-orange uppercase leading-none mt-1">
                Private Limited
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600">
              {companyConfig.shortDescription}
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${companyConfig.whatsappNumber}?text=${encodeURIComponent(
                  companyConfig.whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider transition-colors shadow-sm focus:outline-none"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
              {content.sections.corporateLinks.title}
            </h4>
            <ul className="space-y-3 text-sm">
              {content.sections.corporateLinks.links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:text-brand-orange transition-colors focus:outline-none">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Featured Products */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
              {content.sections.products.title}
            </h4>
            <ul className="space-y-3 text-sm">
              {products.slice(0, 5).map((prod) => (
                <li key={prod.slug}>
                  <Link
                    href={`/products/${prod.slug}`}
                    className="hover:text-brand-orange transition-colors focus:outline-none truncate block max-w-xs"
                  >
                    {prod.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                {content.sections.headquarters.title}
              </h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{companyConfig.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{companyConfig.phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{companyConfig.email}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{companyConfig.operatingHours}</span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                {content.sections.newsletter.title}
              </h5>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={content.sections.newsletter.placeholder}
                  className="rounded-lg bg-white border border-slate-300 p-2 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none grow transition-all"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-brand-orange px-3 hover:bg-brand-orange-light text-white transition-colors focus:outline-none"
                  aria-label={content.sections.newsletter.buttonLabel}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              {subscribed && (
                <p className="mt-1.5 text-[10px] text-emerald-600 font-semibold">
                  {content.sections.newsletter.successMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {content.copyright.template}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {content.policies.map((policy, idx) => (
              <Link key={idx} href={policy.href} className="hover:text-brand-blue transition-colors focus:outline-none">
                {policy.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

