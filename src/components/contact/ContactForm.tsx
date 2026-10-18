"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Loader2, CheckCircle, User, Building2, Phone, Mail, ClipboardList, MessageSquare } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .regex(/^[+]?[0-9\s-]{10,20}$/, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  productRequirement: z.string().min(1, { message: "Please select a product category." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
      productRequirement: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, source: "contact", website: honeypot.current?.value ?? "" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }
      setIsSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    reset();
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 text-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm min-h-[400px] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative inline-flex items-center justify-center p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 mb-6 ring-8 ring-emerald-500/5">
          <CheckCircle className="h-12 w-12 animate-pulse" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-brand-blue dark:text-white">
          Inquiry Submitted!
        </h3>
        <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          Thank you for contacting us. A sales engineer from our Indore team will review your requirements and contact you shortly.
        </p>
        <button
          onClick={handleReset}
          className="mt-8 cursor-pointer rounded-xl bg-brand-blue hover:bg-brand-orange text-xs sm:text-sm font-bold uppercase tracking-wider text-white px-8 py-3.5 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 lg:p-10 shadow-md relative overflow-hidden"
    >
      <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-orange to-brand-orange-light" />

      <div>
        <h3 className="text-lg font-black text-brand-blue dark:text-white uppercase tracking-wider">
          Technical Inquiry Form
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Provide your project requirements below to receive custom pricing and span options.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              <User className="h-4 w-4" />
            </span>
            <input
              {...register("name")}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all shadow-xs"
              placeholder="John Doe"
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-[10px] sm:text-xs text-rose-500 font-semibold">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Company Name *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              <Building2 className="h-4 w-4" />
            </span>
            <input
              {...register("company")}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all shadow-xs"
              placeholder="Engineering Corp Ltd"
            />
          </div>
          {errors.company && (
            <p className="mt-1.5 text-[10px] sm:text-xs text-rose-500 font-semibold">{errors.company.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Contact Number *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              <Phone className="h-4 w-4" />
            </span>
            <input
              {...register("phone")}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all shadow-xs"
              placeholder="+91 98765 43210"
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-[10px] sm:text-xs text-rose-500 font-semibold">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="h-4 w-4" />
            </span>
            <input
              {...register("email")}
              type="email"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all shadow-xs"
              placeholder="client@company.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-[10px] sm:text-xs text-rose-500 font-semibold">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
          Product Requirement *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <ClipboardList className="h-4 w-4" />
          </span>
          <select
            {...register("productRequirement")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all shadow-xs appearance-none cursor-pointer"
          >
            <option value="">Select Building / Service Type</option>
            <option value="peb-buildings">Pre-Engineered Steel Buildings (PEB)</option>
            <option value="warehouse">Industrial Warehouse / Storage Shed</option>
            <option value="factory">Factory / Manufacturing Plant</option>
            <option value="cold-store">Cold Storage / Food Processing Facility</option>
            <option value="hangar">Aircraft Hangar / Large Span Structure</option>
            <option value="commercial">Commercial / Showroom / Institutional Building</option>
            <option value="structural-steel">Heavy Structural Steel</option>
            <option value="accessories">PEB Accessories & Components</option>
            <option value="other">Other / General Enquiry</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {errors.productRequirement && (
          <p className="mt-1.5 text-[10px] sm:text-xs text-rose-500 font-semibold">{errors.productRequirement.message}</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
          Detailed Message & Specifications *
        </label>
        <div className="relative">
          <span className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <MessageSquare className="h-4 w-4" />
          </span>
          <textarea
            {...register("message")}
            rows={5}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all resize-none shadow-xs"
            placeholder="Please describe thickness, material grade, profiles, quantities, and site logistics details..."
          />
        </div>
        {errors.message && (
          <p className="mt-1.5 text-[10px] sm:text-xs text-rose-500 font-semibold">{errors.message.message}</p>
        )}
      </div>

            {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
      )}
<button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-brand-orange p-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-orange-light transition-all disabled:bg-slate-400 shadow-md hover:shadow-lg cursor-pointer focus:outline-none ring-4 ring-transparent focus:ring-brand-orange/10"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
            Sending Inquiry...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Inquiry Message
          </>
        )}
      </button>
    </form>
  );
}
