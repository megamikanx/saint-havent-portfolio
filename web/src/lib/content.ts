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
  HomePage,
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
  settings: `*[_id == "siteSettings"][0]{ title, ownerName, description, logo${IMAGE}, shareImage${IMAGE}, socialLinks[]{ platform, label, url } }`,
  home: `*[_id == "homePage"][0]{ heading, intro, seoDescription, featuredImages[]${IMAGE} }`,
  page: `*[_id == $id][0]{ heading, intro, seoDescription }`,
  about: `*[_id == "aboutPage"][0]{ heading, intro, seoDescription, bio, portrait${IMAGE} }`,
  privacy: `*[_id == "privacyPage"][0]{ heading, seoDescription, body, "updated": coalesce(lastUpdated, _updatedAt) }`,
  collections: `*[_type == "collection" && defined(slug.current)] | order(orderRank) { _id, title, "slug": slug.current, description, cover${IMAGE} }`,
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
// Only during `astro build`: in `astro dev` every refresh refetches, so
// content published in the Studio shows up without restarting the server.
const memo = new Map<string, Promise<unknown>>();
function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (import.meta.env.DEV) return fn();
  if (!memo.has(key)) memo.set(key, fn());
  return memo.get(key) as Promise<T>;
}

export function getSiteSettings(): Promise<SiteSettings> {
  return cached("settings", async () => {
    const raw = await fetchSanity<{
      title?: string;
      ownerName?: string;
      description?: string;
      logo?: RawImage;
      shareImage?: RawImage;
      socialLinks?: SiteSettings["socialLinks"];
    }>(queries.settings);
    if (!raw) return placeholder.settings;
    return {
      title: raw.title || placeholder.settings.title,
      ownerName: raw.ownerName || raw.title || placeholder.settings.ownerName,
      description: raw.description || placeholder.settings.description,
      logo: toImageRef(raw.logo, raw.title),
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

/** Home page text plus its two featured photos (falling back to the first two photos). */
export function getHomePage(): Promise<HomePage> {
  return cached("home", async () => {
    const raw = await fetchSanity<Partial<PageContent> & { featuredImages?: RawImage[] }>(queries.home);
    const { featuredImages, ...rest } = raw ?? {};
    let images = (featuredImages ?? []).map((img) => toImageRef(img)).filter((img): img is ImageRef => !!img);
    if (images.length < 2) {
      const { photos } = await getPhotos();
      images = [...images, ...photos.map((p) => p.image)].slice(0, 2);
    }
    return { ...placeholder.pages.home, ...stripEmpty(rest), featuredImages: images };
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
    if (!isSanityConfigured) return { collections: placeholder.collections, photos: placeholder.photos };
    const [rawCollections, raw] = await Promise.all([
      fetchSanity<(Omit<Collection, "cover"> & { cover?: RawImage })[]>(queries.collections),
      fetchSanity<{ _id: string; caption?: string; collectionId?: string; image: RawImage }[]>(queries.photos),
    ]);
    const photos: Photo[] = [];
    for (const p of raw ?? []) {
      const image = toImageRef(p.image);
      if (image) photos.push({ _id: p._id, image, caption: p.caption, collectionId: p.collectionId });
    }
    const collections: Collection[] = (rawCollections ?? []).map((c) => ({
      ...c,
      // No cover chosen? Use the shoot's first photo.
      cover: toImageRef(c.cover, c.title) ?? photos.find((p) => p.collectionId === c._id)?.image,
    }));
    return { collections, photos };
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
    // Until the first release is added in the Studio, show the placeholder releases.
    if (!raw?.length) return placeholder.releases;
    return raw.map((r) => ({ ...r, cover: toImageRef(r.cover, r.title) }));
  });
}

/** Drops null/empty-string fields so they don't overwrite placeholder defaults. */
function stripEmpty<T extends object>(obj: T | null | undefined): Partial<T> {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  ) as Partial<T>;
}
