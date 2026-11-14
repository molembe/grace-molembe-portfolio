import type { Metadata } from "next";
import { siteConfig as staticSiteConfig } from "@/data/site-config";
import type { SiteConfig } from "@/types";

/** Factory de métadonnées par page (SEO + Open Graph cohérents). */

export function pageMetadata(options: {
  title?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const siteConfig = staticSiteConfig;
  const title = options.title
    ? `${options.title} — ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.role}`;
  const url = `${siteConfig.url}${options.path}`;

  return {
    title: { absolute: title },
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: options.description,
      url,
      siteName: `${siteConfig.name} — Portfolio Engineering`,
      type: options.type ?? "website",
      locale: "fr_FR",
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
      images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: options.description,
      images: ["/images/og-default.png"],
    },
  };
}

/** JSON-LD Person — données factuelles uniquement (config fusionnée back-office). */
export function personJsonLd(config?: SiteConfig) {
  const siteConfig = config ?? staticSiteConfig;
  const sameAs: string[] = [];
  if (siteConfig.social.github !== "TBD") sameAs.push(siteConfig.social.github);
  if (siteConfig.social.linkedin !== "TBD") sameAs.push(siteConfig.social.linkedin);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: siteConfig.role,
    description: siteConfig.intro,
    knowsAbout: [
      "Network Engineering",
      "Linux System Administration",
      "Ansible",
      "DevSecOps",
      "Cybersecurity",
      "PKI",
      "Virtualization",
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
}
