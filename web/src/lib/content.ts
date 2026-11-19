/**
 * All content the pages need, fetched from Sanity at build time.
 *
 * If Sanity isn't configured yet (no PUBLIC_SANITY_PROJECT_ID), or a document
 * hasn't been created in the Studio, the placeholders in ./placeholders.ts are
 * used instead, so the site always builds and every page has content.
 */
import { isSanityConfigured, sanity, type SanityImageSource } from "./sanity.ts";
import * as placeholder from "./placeholders.ts";
import type {
  AboutPage,
  Collection,
  ImageRef,
  PageContent,
  PageKey,
  Photo,
  PrivacyPage,
  Release,
  SiteSettings,
  Video,
} from "./types.ts";

// Expands an image's asset reference so we get its ID, dimensions and blur placeholder.
const IMAGE = `{ ..., asset->{ _id, metadata { dimensions, lqip } } }`;

const queries = {
  settings: `*[_id == "siteSettings"][0]{ title, description, shareImage${IMAGE}, socialLinks[]{ platform, label, url } }`,
  page: `*[_id == $id][0]{ heading, intro, seoDescription }`,
  about: `*[_id == "aboutPage"][0]{ heading, intro, seoDescription, bio, portrait${IMAGE} }`,
  privacy: `*[_id == "privacyPage"][0]{ heading, seoDescription, body, "updated": coalesce(lastUpdated, _updatedAt) }`,
  collections: `*[_type == "collection"] | order(orderRank) { _id, title, description }`,
  photos: `*[_type == "photo" && defined(image.asset)] | order(orderRank) { _id, caption, "collectionId": collection._ref, image${IMAGE} }`,
  videos: `*[_type == "video" && defined(url)] | order(orderRank) { _id, title, url, description }`,
  releases: `*[_type == "release" && defined(bandcamp)] | order(orderRank) { _id, title, year, bandcamp, cover${IMAGE} }`,
};

type RawImage = (SanityImageSource & { alt?: string }) | null | undefined;

async function fetchSanity<T>(query: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!sanity) return null;
  return sanity.fetch<T>(query, params);
}

/** Converts a raw Sanity image into an ImageRef, or undefined if no file was uploaded. */
function toImageRef(raw: RawImage, fallbackAlt = ""): ImageRef | undefined {
  const dims = raw?.asset?.metadata?.dimensions;
  if (!raw?.asset?._id || !dims) return undefined;
  return {
    kind: "sanity",
    source: raw,
    width: dims.width,
    height: dims.height,
    alt: raw.alt?.trim() || fallbackAlt,
    lqip: raw.asset.metadata?.lqip,
  };
}

// Builds run once, so cache each query for the duration of the build.
const memo = new Map<string, Promise<unknown>>();
function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!memo.has(key)) memo.set(key, fn());
  return memo.get(key) as Promise<T>;
}

export function getSiteSettings(): Promise<SiteSettings> {
  return cached("settings", async () => {
    const raw = await fetchSanity<{
      title?: string;
      description?: string;
      shareImage?: RawImage;
      socialLinks?: SiteSettings["socialLinks"];
    }>(queries.settings);
    if (!raw) return placeholder.settings;
    return {
      title: raw.title || placeholder.settings.title,
      description: raw.description || placeholder.settings.description,
      shareImage: toImageRef(raw.shareImage, raw.title),
      socialLinks: (raw.socialLinks ?? []).filter((l) => l?.url),
    };
  });
}

export function getPage(key: PageKey): Promise<PageContent> {
  return cached(`page:${key}`, async () => {
    const raw = await fetchSanity<Partial<PageContent>>(queries.page, { id: `${key}Page` });
    return { ...placeholder.pages[key], ...stripEmpty(raw) };
  });
}

export function getAboutPage(): Promise<AboutPage> {
  return cached("about", async () => {
    const raw = await fetchSanity<Partial<AboutPage> & { portrait?: RawImage }>(queries.about);
    if (!isSanityConfigured || !raw) return placeholder.about;
    const { portrait, ...rest } = raw;
    return {
      ...placeholder.pages.about,
      ...stripEmpty(rest),
      bio: raw.bio?.length ? raw.bio : placeholder.about.bio,
      portrait: toImageRef(portrait),
    };
  });
}

export function getPrivacyPage(): Promise<PrivacyPage> {
  return cached("privacy", async () => {
    const raw = await fetchSanity<Partial<PrivacyPage>>(queries.privacy);
    if (!raw) return placeholder.privacy;
    return {
      ...placeholder.privacy,
      ...stripEmpty(raw),
      // Fall back to the built-in policy until the artist writes their own.
      body: raw.body?.length ? raw.body : placeholder.privacy.body,
    };
  });
}

export function getPhotos(): Promise<{ collections: Collection[]; photos: Photo[] }> {
  return cached("photos", async () => {
    if (!isSanityConfigured) return { collections: [], photos: placeholder.photos };
    const [collections, raw] = await Promise.all([
      fetchSanity<Collection[]>(queries.collections),
      fetchSanity<{ _id: string; caption?: string; collectionId?: string; image: RawImage }[]>(queries.photos),
    ]);
    const photos: Photo[] = [];
    for (const p of raw ?? []) {
      const image = toImageRef(p.image);
      if (image) photos.push({ _id: p._id, image, caption: p.caption, collectionId: p.collectionId });
    }
    return { collections: collections ?? [], photos };
  });
}

export function getVideos(): Promise<Video[]> {
  return cached("videos", async () => {
    if (!isSanityConfigured) return placeholder.videos;
    return (await fetchSanity<Video[]>(queries.videos)) ?? [];
  });
}

export function getReleases(): Promise<Release[]> {
  return cached("releases", async () => {
    if (!isSanityConfigured) return placeholder.releases;
    const raw = await fetchSanity<(Omit<Release, "cover"> & { cover?: RawImage })[]>(queries.releases);
    return (raw ?? []).map((r) => ({ ...r, cover: toImageRef(r.cover, r.title) }));
  });
}

/** Drops null/empty-string fields so they don't overwrite placeholder defaults. */
function stripEmpty<T extends object>(obj: T | null | undefined): Partial<T> {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  ) as Partial<T>;
}
