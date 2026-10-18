import { MetadataRoute } from "next";
import { getProducts } from "@/lib/content/site";
import { getJobs, getProjects } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, jobs, products] = await Promise.all([getProjects(), getJobs(), getProducts()]);
  const siteUrl = "https://www.infinityfabtech.com";
  
  const staticRoutes = [
    "",
    "/about",
    "/products",
    "/3d-models",
    "/projects",
    "/services",
    "/careers",
    "/request-quote",
    "/contact",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((prod) => ({
    url: `${siteUrl}/products/${prod.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const jobRoutes = jobs.map((job) => ({
    url: `${siteUrl}/careers/${job.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...projectRoutes, ...jobRoutes];
}
