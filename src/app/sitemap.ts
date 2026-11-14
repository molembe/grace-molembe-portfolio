import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site-config";
import { getProjects, getLabs, getArticles } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();
  const [allProjects, allArticles] = await Promise.all([getProjects(), getArticles()]);

  const staticRoutes: MetadataRoute.Sitemap = ([
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/skills`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/network-lab`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/system-lab`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/experience`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.6 },
  ] as MetadataRoute.Sitemap).map((r) => ({ ...r, lastModified: now }));

  const projects: MetadataRoute.Sitemap = allProjects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const labs: MetadataRoute.Sitemap = getLabs().map((l) => ({
    url: `${base}/${l.kind === "network" ? "network-lab" : "system-lab"}/${l.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articles: MetadataRoute.Sitemap = allArticles.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(`${a.date}T00:00:00`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projects, ...labs, ...articles];
}
