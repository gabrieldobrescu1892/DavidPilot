import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{const base="https://davidpilot.com";return ["","/about","/solutions","/resources","/contact"].map(p=>({url:base+p,lastModified:new Date(),changeFrequency:p?"monthly":"weekly",priority:p?0.8:1}))}
