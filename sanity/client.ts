import { createImageUrlBuilder } from "@sanity/image-url";
import { createClient, defineQuery } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

export const client = createClient({
  projectId: projectId || "missing",
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = createImageUrlBuilder({ projectId: projectId || "missing", dataset });

export type SanityImage = {
  asset?: { _ref: string };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
};

export type Project = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  coverImage?: SanityImage;
  gallery?: SanityImage[];
};

export type HomePage = {
  heroImages?: SanityImage[];
  bio?: string;
};

/** Placeholder shown wherever Sanity has no image yet. */
export const PLACEHOLDER_IMAGE = "/assets/dog-memes-dog-meme.png";

/** Returns a Sanity CDN URL for the image, or the local placeholder. */
export function imageUrl(image: SanityImage | undefined, width = 1600): string {
  if (!isSanityConfigured || !image?.asset) return PLACEHOLDER_IMAGE;
  return builder.image(image).width(width).auto("format").url();
}

const projectFields = `_id, title, "slug": slug.current, category, description, coverImage, gallery`;

const projectsByCategoryQuery = defineQuery(
  `*[_type == "project" && category == $category && defined(slug.current)] | order(order asc, _createdAt desc){${projectFields}}`,
);
const projectBySlugQuery = defineQuery(
  `*[_type == "project" && category == $category && slug.current == $slug][0]{${projectFields}}`,
);
const homePageQuery = defineQuery(`*[_id == "homePage"][0]{heroImages, bio}`);

// Each helper returns empty data (instead of throwing) when Sanity isn't set up,
// so the site still renders with placeholders.
async function safeFetch<T>(query: string, params: Record<string, string>, fallback: T): Promise<T> {
  if (!isSanityConfigured) return fallback;
  try {
    return (await client.fetch<T>(query, params)) ?? fallback;
  } catch (err) {
    console.error("Sanity fetch failed:", err);
    return fallback;
  }
}

export function getProjects(category: string) {
  return safeFetch<Project[]>(projectsByCategoryQuery, { category }, []);
}

export function getProject(category: string, slug: string) {
  return safeFetch<Project | null>(projectBySlugQuery, { category, slug }, null);
}

export function getHomePage() {
  return safeFetch<HomePage>(homePageQuery, {}, {});
}
