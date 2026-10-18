"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

const quoteFormSchema = z.object({
  name: z.string().min(2, { message: "Please enter your full name." }),
  company: z.string().min(2, { message: "Please enter your company name." }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .regex(/^[+]?[0-9\s-]{10,20}$/, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  productRequirement: z.string().min(1, { message: "Please select a requirement." }),
  otherRequirement: z.string().optional(),
  location: z.string().optional(),
  message: z.string().min(10, { message: "Please describe your requirement (min. 10 characters)." }),
}).refine((v) => v.productRequirement !== "other" || (v.otherRequirement?.trim().length ?? 0) >= 2, {
  path: ["otherRequirement"],
  message: "Please specify your requirement.",
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const buildingTypes = [
  { value: "warehouse", label: "Industrial Warehouse / Storage Shed" },
  { value: "factory", label: "Factory / Manufacturing Plant" },
  { value: "cold-store", label: "Cold Storage / Food Processing Facility" },
  { value: "hangar", label: "Aircraft Hangar / Large Span Structure" },
  { value: "commercial", label: "Commercial / Showroom / Institutional Building" },
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all";

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
        {label}
        {required ? <span className="text-brand-orange ml-0.5">*</span> : <span className="ml-1.5 text-xs font-medium text-slate-400">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export default function QuoteForm() {
  const { products } = useSiteContent();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("product") ?? "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
      productRequirement: preselected,
      otherRequirement: "",
      location: "",
      message: "",
    },
  });

  const isOther = watch("productRequirement") === "other";

  const onSubmit = async (data: QuoteFormValues) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, source: "quote", website: honeypot.current?.value ?? "" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 p-10 sm:p-14 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h2 className="mt-6 text-2xl font-black text-brand-blue tracking-tight">Thank you. Your request has been received.</h2>
        <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Our engineering team will review your requirements and send a detailed quotation to your
          registered email address within 24 working hours.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/projects"
            className="rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 transition-colors"
          >
            View Our Projects
          </Link>
          <button
            type="button"
            onClick={() => {
              reset();
              setIsSuccess(false);
            }}
            className="rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider px-6 py-3.5 transition-colors cursor-pointer"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-xl bg-white border border-slate-200 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.08)] divide-y divide-slate-200"
    >
      <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {/* Section 1 */}
      <fieldset className="p-6 sm:p-8 space-y-5">
        <legend className="sr-only">Contact details</legend>
        <div>
          <h2 className="text-lg font-black text-brand-blue tracking-tight">1. Contact Details</h2>
          <p className="text-xs text-slate-500 mt-1">Tell us who we should send the quotation to.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full name" required error={errors.name?.message}>
            <input {...register("name")} autoComplete="name" className={inputClass} placeholder="e.g. Rajesh Sharma" />
          </Field>
          <Field label="Company name" required error={errors.company?.message}>
            <input {...register("company")} autoComplete="organization" className={inputClass} placeholder="e.g. Sharma Industries Pvt. Ltd." />
          </Field>
          <Field label="Phone number" required error={errors.phone?.message}>
            <input {...register("phone")} type="tel" autoComplete="tel" className={inputClass} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Email address" required error={errors.email?.message}>
            <input {...register("email")} type="email" autoComplete="email" className={inputClass} placeholder="name@company.com" />
          </Field>
        </div>
      </fieldset>

      {/* Section 2 */}
      <fieldset className="p-6 sm:p-8 space-y-5">
        <legend className="sr-only">Project requirements</legend>
        <div>
          <h2 className="text-lg font-black text-brand-blue tracking-tight">2. Project Requirements</h2>
          <p className="text-xs text-slate-500 mt-1">The more detail you share, the more accurate our quotation.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Requirement type" required error={errors.productRequirement?.message}>
            <div className="relative">
              <select {...register("productRequirement")} className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
                <option value="">Select building / product</option>
                <optgroup label="Building type">
                  {buildingTypes.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Products">
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
                <option value="other">Other (please specify)</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </Field>
          {isOther && (
            <Field label="Please specify" required error={errors.otherRequirement?.message}>
              <input
                {...register("otherRequirement")}
                className={inputClass}
                placeholder="Type your requirement"
                autoFocus
              />
            </Field>
          )}
          <Field label="Project location" error={errors.location?.message}>
            <input {...register("location")} className={inputClass} placeholder="City, State" />
          </Field>
        </div>
        <Field
          label="Technical requirements & quantities"
          required
          error={errors.message?.message}
          hint="Include dimensions (length × width × height), load conditions, material grade, quantities and expected timeline."
        >
          <textarea
            {...register("message")}
            rows={6}
            className={`${inputClass} resize-y`}
            placeholder="Describe your project requirements..."
          />
        </Field>
      </fieldset>

      {/* Submit */}
      <div className="p-6 sm:p-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/60 rounded-b-xl">
        <p className="text-xs text-slate-500">
          Fields marked <span className="text-brand-orange font-bold">*</span> are required.
        </p>
              {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
      )}
<button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-brand-orange hover:bg-brand-orange-light disabled:bg-slate-400 text-white text-xs font-bold uppercase tracking-wider px-8 py-4 transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-orange/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Quote Request"
          )}
        </button>
      </div>
    </form>
  );
}
