import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://amareacosmetics.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const productSlugs = ["conero", "sibilla", "catria"];
const teamSlugs = [
  "lucia-amici",
  "lucia-potalivo",
  "luca-tiano",
  "patrick-orlando",
  "fabiola-sciacca",
  "ilenia-cirilli",
];

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  ...productSlugs.map((s) => ({ path: `/prodotti/${s}`, changefreq: "monthly" as const, priority: "0.8" })),
  ...teamSlugs.map((s) => ({ path: `/team/${s}`, changefreq: "monthly" as const, priority: "0.6" })),
];

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);