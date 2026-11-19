// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { loadEnv } from "vite";

// Astro doesn't expose .env values to this config file automatically.
const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

export default defineConfig({
  // Used for canonical URLs, Open Graph tags and the sitemap.
  site: env.SITE_URL || "http://localhost:4321",
  // Plain static HTML. The contact form is handled by a Cloudflare Pages
  // Function in /functions, so no server adapter is needed.
  output: "static",
  trailingSlash: "ignore",
  integrations: [
    sitemap({
      // Form result pages are noindex and shouldn't be in the sitemap.
      filter: (page) => !/\/contact\/(thanks|error)\/?$/.test(page),
    }),
  ],
});
