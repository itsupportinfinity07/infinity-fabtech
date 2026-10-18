import "server-only";
import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/firebase";
import { landingContent } from "@/data/landing";
import { aboutContent } from "@/data/about";
import { companyConfig } from "@/data/company";
import { contactContent } from "@/data/contact";
import { footerContent } from "@/data/footer";
import { careersContent } from "@/data/careers";
import { projectsPageContent } from "@/data/projects";
import { servicesPageContent, services as staticServices } from "@/data/services";
import { products as staticProducts } from "@/data/products";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import type { Product } from "@/types/product";
import type { Service } from "@/types/service";

/**
 * Page copy, products, services and testimonials, edited in the admin panel and stored in
 * Firestore. The built-in content in src/data is the default for every missing field and
 * the fallback when Firestore is unreachable.
 */

const REVALIDATE = 3600;

const PAGE_DEFAULTS = {
  landing: landingContent,
  about: aboutContent,
  company: companyConfig,
  contact: contactContent,
  footer: footerContent,
  careers: { hero: careersContent.hero, perks: careersContent.perks },
  projectsPage: projectsPageContent,
  servicesPage: servicesPageContent,
};
export type PageKey = keyof typeof PAGE_DEFAULTS;
export type PageContent<K extends PageKey> = (typeof PAGE_DEFAULTS)[K];

type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> => !!v && typeof v === "object" && !Array.isArray(v);

/** Objects merge recursively; arrays and values from Firestore replace the default. */
function merge<T>(defaults: T, override: Json): T {
  if (!isObj(defaults) || !isObj(override)) return (override === undefined || override === null ? defaults : override) as T;
  const out: Record<string, Json> = { ...defaults };
  for (const [k, v] of Object.entries(override)) out[k] = k in defaults ? merge((defaults as Record<string, Json>)[k], v) : v;
  return out as T;
}

async function loadPage<K extends PageKey>(key: K): Promise<PageContent<K>> {
  const db = getDb();
  const defaults = PAGE_DEFAULTS[key];
  if (!db) return defaults;
  try {
    const snap = await db.collection("pages").doc(key).get();
    return snap.exists ? merge(defaults, snap.data()?.content) : defaults;
  } catch (e) {
    console.error(`getPage(${key}) failed, using built-in content:`, e);
    return defaults;
  }
}

export async function getPage<K extends PageKey>(key: K): Promise<PageContent<K>> {
  return unstable_cache(() => loadPage(key), ["content-page", key], { tags: ["pages"], revalidate: REVALIDATE })();
}

function sortByOrder<T extends { sortOrder?: number }>(a: T[]) {
  return [...a].sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0));
}

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const db = getDb();
    if (!db) return staticProducts;
    try {
      const snap = await db.collection("products").get();
      return sortByOrder(
        snap.docs.map((s) => {
          const d = s.data();
          return {
            slug: d.slug ?? s.id, name: d.name ?? "", category: d.category ?? "", shortDescription: d.shortDescription ?? "",
            fullDescription: d.fullDescription ?? "", image: d.image ?? "", images: (d.images ?? []).filter(Boolean),
            features: d.features ?? [], benefits: d.benefits ?? [], specifications: d.specifications ?? {},
            applications: d.applications ?? [], sortOrder: d.sortOrder ?? 0,
          };
        })
      ).map((p) => ({ ...p, image: p.image || p.images[0] || "/images/products/peb-building.png" }));
    } catch (e) {
      console.error("getProducts failed, using built-in content:", e);
      return staticProducts;
    }
  },
  ["content-products"],
  { tags: ["products"], revalidate: REVALIDATE }
);

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

export const getServices = unstable_cache(
  async (): Promise<Service[]> => {
    const db = getDb();
    if (!db) return staticServices;
    try {
      const snap = await db.collection("services").get();
      return sortByOrder(
        snap.docs.map((s) => {
          const d = s.data();
          return {
            id: d.id ?? s.id, title: d.title ?? "", description: d.description ?? "", benefits: d.benefits ?? [],
            iconName: d.iconName ?? "Building2", sortOrder: d.sortOrder ?? 0,
          };
        })
      );
    } catch (e) {
      console.error("getServices failed, using built-in content:", e);
      return staticServices;
    }
  },
  ["content-services"],
  { tags: ["services"], revalidate: REVALIDATE }
);

export type Testimonial = (typeof staticTestimonials)[number];

export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const db = getDb();
    // Built-in testimonials were never shown on the site, so they are not a fallback.
    if (!db) return [];
    try {
      const snap = await db.collection("testimonials").get();
      return sortByOrder(
        snap.docs
          .map((s) => ({ ...s.data(), id: s.id }) as Testimonial & { isVisible?: boolean; sortOrder?: number })
          .filter((t) => t.isVisible === true)
      );
    } catch (e) {
      console.error("getTestimonials failed:", e);
      return [];
    }
  },
  ["content-testimonials"],
  { tags: ["testimonials"], revalidate: REVALIDATE }
);

/** Everything client components need, passed once through the layout. */
export async function getSiteContext() {
  const [landing, company, footer, products, services, testimonials] = await Promise.all([
    getPage("landing"), getPage("company"), getPage("footer"), getProducts(), getServices(), getTestimonials(),
  ]);
  return { landing, company, footer, products, services, testimonials };
}
export type SiteContext = Awaited<ReturnType<typeof getSiteContext>>;
