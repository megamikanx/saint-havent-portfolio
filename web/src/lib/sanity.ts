import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";

/** False until the env vars are set; the site then renders placeholder content. */
export const isSanityConfigured = projectId.length > 0;

export const sanity: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2026-11-01",
      // The site is rebuilt on every publish, so read fresh data, not the CDN cache.
      useCdn: false,
      perspective: "published",
    })
  : null;

const builder = isSanityConfigured ? createImageUrlBuilder({ projectId, dataset }) : null;

/** A Sanity image as returned by our GROQ queries (see queries.ts). */
export type SanityImageSource = {
  asset: {
    _id: string;
    metadata?: { dimensions?: { width: number; height: number }; lqip?: string };
  };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; height: number; width: number };
};

/**
 * Builds a Sanity CDN URL. `auto=format` serves AVIF or WebP to browsers that
 * support them; passing both width and height crops around the hotspot the
 * artist set in the Studio.
 */
export function sanityImageUrl(
  image: SanityImageSource,
  { width, height, quality = 80 }: { width: number; height?: number; quality?: number },
): string {
  if (!builder) return "";
  let b = builder.image(image).width(width).auto("format").quality(quality);
  if (height) b = b.height(height).fit("crop");
  return b.url();
}
