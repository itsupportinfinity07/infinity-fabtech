"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, PhoneCall } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/components/SiteContentProvider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Products", href: "/products" },
  { name: "3D Models", href: "/3d-models" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { company: companyConfig } = useSiteContent();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { openQuote } = useQuote();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-white/95 dark:bg-slate-950/95 shadow-md backdrop-blur-md py-3 border-b border-slate-100 dark:border-slate-800"
            : "bg-transparent py-5"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex flex-col items-start focus:outline-none"
            >
              <span className={cn(
                "text-xl font-black tracking-tight uppercase leading-none transition-colors",
                !isScrolled && pathname === "/" ? "text-white" : "text-brand-blue dark:text-white"
              )}>
                Infinity Fabtech
              </span>
              <span className={cn(
                "text-[9px] font-bold tracking-widest uppercase leading-none mt-1",
                !isScrolled && pathname === "/" ? "text-brand-steel" : "text-brand-orange"
              )}>
                Private Limited
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-semibold tracking-wide hover:text-brand-orange transition-colors relative py-1 focus:outline-none",
                      isActive
                        ? "text-brand-orange"
                        : !isScrolled && pathname === "/"
                          ? "text-white hover:text-white/80"
                          : "text-slate-700 dark:text-slate-200"
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions / CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <a
                href={`tel:${companyConfig.phoneFormatted}`}
                className={cn(
                  "flex items-center text-xs font-bold gap-1.5 transition-colors focus:outline-none",
                  !isScrolled && pathname === "/" ? "text-white/90 hover:text-white" : "text-slate-600 dark:text-slate-300 hover:text-brand-blue"
                )}
              >
                <PhoneCall className="h-3.5 w-3.5 text-brand-orange animate-pulse" />
                {companyConfig.phone}
              </a>
              <button
                onClick={openQuote}
                className={cn(
                  "cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none",
                  !isScrolled && pathname === "/"
                    ? "bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50"
                    : "bg-brand-orange hover:bg-brand-orange-light"
                )}
              >
                Get a Quote
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex lg:hidden items-center space-x-3">
              <button
                onClick={openQuote}
                className={cn(
                  "cursor-pointer rounded-lg p-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all focus:outline-none",
                  !isScrolled && pathname === "/"
                    ? "bg-white/10 border border-white/20"
                    : "bg-brand-orange"
                )}
                aria-label="Request quote"
              >
                Quote
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "rounded-lg p-2 focus:outline-none transition-colors",
                  !isScrolled && pathname === "/"
                    ? "text-white hover:bg-white/10"
                    : "text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                aria-expanded={isOpen}
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        {/* Mobile Backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Drawer content */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-slate-900 p-6 shadow-2xl transition-transform duration-300 flex flex-col justify-between border-l border-slate-100 dark:border-slate-800",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-brand-blue dark:text-white uppercase">
                  Infinity Fabtech
                </span>
                <span className="text-[8px] font-bold tracking-widest text-brand-orange uppercase">
                  Private Limited
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col space-y-4 mt-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-base font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none",
                      isActive
                        ? "text-brand-orange bg-brand-orange/5 font-bold"
                        : "text-slate-800 dark:text-slate-200"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <a
              href={`tel:${companyConfig.phoneFormatted}`}
              className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 gap-2 focus:outline-none"
            >
              <PhoneCall className="h-4 w-4 text-brand-orange" />
              {companyConfig.phone}
            </a>
            <button
              onClick={() => {
                setIsOpen(false);
                openQuote();
              }}
              className="cursor-pointer flex w-full items-center justify-center rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white hover:bg-brand-orange-light shadow-md transition-all focus:outline-none"
            >
              Get a Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
