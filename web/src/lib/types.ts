import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "./sanity.ts";

/**
 * An image from Sanity, or a local placeholder used before Sanity is
 * connected. Components render both through <Img />.
 */
export type ImageRef =
  | { kind: "sanity"; source: SanityImageSource; width: number; height: number; alt: string; lqip?: string }
  | { kind: "local"; src: string; width: number; height: number; alt: string };

export type SocialLink = { platform: string; label?: string; url: string };

export type SiteSettings = {
  title: string;
  /** Name shown in the footer's © line. */
  ownerName: string;
  logo?: ImageRef;
  description: string;
  shareImage?: ImageRef;
  socialLinks: SocialLink[];
};

export type PageKey = "home" | "about" | "photography" | "videography" | "music" | "contact";

export type PageContent = {
  heading: string;
  intro?: string;
  seoDescription?: string;
};

export type AboutPage = PageContent & { bio?: PortableTextBlock[]; portrait?: ImageRef };

export type PrivacyPage = { heading: string; seoDescription?: string; body?: PortableTextBlock[]; updated?: string };

export type HomePage = PageContent & { featuredImages: ImageRef[] };

/** A photo shoot / series. Listed on /photography, with its own gallery page. */
export type Collection = { _id: string; title: string; slug: string; description?: string; cover?: ImageRef };

export type Photo = { _id: string; image: ImageRef; caption?: string; collectionId?: string };

export type Video = { _id: string; title: string; url: string; description?: string };

export type Release = { _id: string; title: string; year?: number; cover?: ImageRef; bandcamp: string };
