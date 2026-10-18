import "server-only";
import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase";
import { projects as staticProjects } from "@/data/projects";
import { CLIENT_LOCATIONS } from "@/data/clientLocations";
import { careersContent } from "@/data/careers";
import type { Project } from "@/types/project";

/**
 * Public content readers. Data comes from Firestore (edited in the admin panel).
 * If Firestore is not configured or unreachable, the built-in content in src/data is used,
 * so the site never goes blank. Each reader is cached and refreshed by the admin
 * through POST /api/revalidate (tags below), with a 1 hour safety net.
 */

const REVALIDATE = 3600;
const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate().toISOString() : (v as string | undefined) ?? "");
const imgUrl = (id: string) => `/api/img/${id}`;

// ---------- Projects ----------

type ProjectDoc = {
  slug: string; name: string; client: string; type: string; area: string; year: string; description: string;
  highlights: string[]; scope: string[]; locationLabel: string; coverImageId: string;
  images: { id: string; alt: string }[]; isFeatured: boolean; sortOrder: number; status: string;
  seoTitle?: string; seoDesc?: string;
};

export type SiteProject = Project & { isFeatured: boolean; seoTitle: string; seoDesc: string; imageAlts: string[] };

function toProject(d: ProjectDoc): SiteProject {
  const gallery = d.images.map((i) => imgUrl(i.id));
  return {
    id: d.slug,
    name: d.name,
    location: d.locationLabel,
    client: d.client,
    type: d.type,
    area: d.area,
    year: d.year,
    description: d.description,
    highlights: d.highlights ?? [],
    scope: d.scope ?? [],
    image: d.coverImageId ? imgUrl(d.coverImageId) : (gallery[0] ?? "/images/products/peb-building.png"),
    gallery,
    imageAlts: d.images.map((i) => i.alt),
    isFeatured: Boolean(d.isFeatured),
    seoTitle: d.seoTitle ?? "",
    seoDesc: d.seoDesc ?? "",
  };
}

const fallbackProjects = (): SiteProject[] =>
  staticProjects.map((p, i) => ({ ...p, isFeatured: i < 2, seoTitle: "", seoDesc: "", imageAlts: [] }));

export const getProjects = unstable_cache(
  async (): Promise<SiteProject[]> => {
    const db = getDb();
    if (!db) return fallbackProjects();
    try {
      const snap = await db.collection("projects").where("status", "==", "published").get();
      return snap.docs
        .map((s) => s.data() as ProjectDoc)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toProject);
    } catch (e) {
      console.error("getProjects failed, using built-in content:", e);
      return fallbackProjects();
    }
  },
  ["content-projects"],
  { tags: ["projects"], revalidate: REVALIDATE }
);

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.id === slug) ?? null;
}

export async function getFeaturedProjects(limit = 2) {
  const all = await getProjects();
  const featured = all.filter((p) => p.isFeatured);
  return (featured.length ? featured : all).slice(0, limit);
}

// ---------- Map locations ----------

export type { MapLocation, MapProject } from "@/lib/map-types";
import type { MapLocation, MapProject } from "@/lib/map-types";

type LocationDoc = { city: string; state: string; lat: number; lng: number; showOnMap: boolean; legacyClients: string[] };

export const getMapLocations = unstable_cache(
  async (): Promise<MapLocation[]> => {
    const fallback = (): MapLocation[] =>
      CLIENT_LOCATIONS.map((l) => ({ ...l, projects: [] }));
    const db = getDb();
    if (!db) return fallback();
    try {
      const [locSnap, projSnap] = await Promise.all([
        db.collection("locations").get(),
        db.collection("projects").where("status", "==", "published").get(),
      ]);
      const byLoc = new Map<string, MapProject[]>();
      for (const s of projSnap.docs) {
        const p = s.data() as ProjectDoc & { locationId?: string };
        if (!p.locationId) continue;
        const list = byLoc.get(p.locationId) ?? [];
        list.push({
          id: p.slug, name: p.name, type: p.type, year: p.year,
          image: p.coverImageId ? imgUrl(p.coverImageId) : "",
        });
        byLoc.set(p.locationId, list);
      }
      return locSnap.docs
        .map((s) => ({ id: s.id, ...(s.data() as LocationDoc) }))
        .filter((l) => l.showOnMap && Number.isFinite(l.lat) && Number.isFinite(l.lng))
        .map((l) => ({
          id: l.id, city: l.city, state: l.state, lat: l.lat, lng: l.lng,
          clients: l.legacyClients ?? [], projects: byLoc.get(l.id) ?? [],
        }))
        .filter((l) => l.clients.length + l.projects.length > 0);
    } catch (e) {
      console.error("getMapLocations failed, using built-in content:", e);
      return fallback();
    }
  },
  ["content-locations"],
  { tags: ["locations", "projects"], revalidate: REVALIDATE }
);

// ---------- Jobs ----------

export interface SiteJob {
  slug: string; title: string; department: string; location: string; type: string; experience: string;
  summary: string; responsibilities: string[]; requirements: string[]; postedAt: string; closesAt: string;
}

export const getJobs = unstable_cache(
  async (): Promise<SiteJob[]> => {
    const db = getDb();
    if (!db) return careersContent.openings.map((j) => ({ ...j, postedAt: "", closesAt: "" }));
    try {
      const snap = await db.collection("jobs").where("status", "==", "open").get();
      const today = new Date().toISOString().slice(0, 10);
      return snap.docs
        .map((s) => {
          const d = s.data();
          return {
            slug: d.slug, title: d.title, department: d.department, location: d.location, type: d.type,
            experience: d.experience ?? "", summary: d.summary, responsibilities: d.responsibilities ?? [],
            requirements: d.requirements ?? [], postedAt: iso(d.postedAt), closesAt: d.closesAt ?? "",
          } as SiteJob;
        })
        .filter((j) => !j.closesAt || j.closesAt >= today)
        .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    } catch (e) {
      console.error("getJobs failed, using built-in content:", e);
      return careersContent.openings.map((j) => ({ ...j, postedAt: "", closesAt: "" }));
    }
  },
  ["content-jobs"],
  // Short revalidate so a job passes its closing date without needing a save.
  { tags: ["jobs"], revalidate: 600 }
);

export async function getJob(slug: string) {
  return (await getJobs()).find((j) => j.slug === slug) ?? null;
}
