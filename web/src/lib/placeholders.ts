/**
 * Placeholder content shown until the artist fills things in through Sanity.
 * Safe to edit or delete entries once real content exists.
 */
import type { PortableTextBlock } from "@portabletext/types";
import type { AboutPage, Collection, ImageRef, PageContent, PageKey, Photo, PrivacyPage, Release, SiteSettings, Video } from "./types.ts";

const img = (name: string, width: number, height: number, alt: string): ImageRef => ({
  kind: "local",
  src: `/placeholder/${name}.svg`,
  width,
  height,
  alt,
});

/** Builds simple Portable Text from plain strings. Strings starting with "## " become headings. */
export function blocks(...paragraphs: string[]): PortableTextBlock[] {
  return paragraphs.map((text, i) => {
    const isHeading = text.startsWith("## ");
    return {
      _type: "block",
      _key: `p${i}`,
      style: isHeading ? "h2" : "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `s${i}`, text: isHeading ? text.slice(3) : text, marks: [] }],
    };
  });
}

const LOREM =
  "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

export const settings: SiteSettings = {
  title: "Saint Haven't",
  ownerName: "Joel Goh",
  description: "Photography, videography and music by Joel Goh.",
  socialLinks: [
    { platform: "instagram", url: "https://instagram.com/" },
    { platform: "bandcamp", url: "https://fujideathcult.bandcamp.com/" },
  ],
};

export const pages: Record<PageKey, PageContent> = {
  home: { heading: "Saint Haven't", intro: LOREM },
  about: { heading: "About", intro: "A little about me and my work." },
  photography: { heading: "Photography", intro: "Selected shoots and series." },
  videography: { heading: "Videography", intro: "Music videos, short films and visual work." },
  music: { heading: "Music", intro: "Releases and projects." },
  contact: { heading: "Contact", intro: "For bookings, collaborations and commissions, send a message below." },
};

export const about: AboutPage = {
  ...pages.about,
  bio: blocks(
    "This is placeholder bio text. Replace it in the Studio under Pages → About.",
    "Write a few short paragraphs about your background, the kind of work you make, and who you like to work with.",
  ),
  portrait: img("portrait", 800, 1000, "Placeholder portrait"),
};

export const collections: Collection[] = [
  { _id: "c1", title: "First photoshoot", slug: "first-photoshoot", description: LOREM, cover: img("shoot-1", 2080, 1000, "Placeholder cover for the first photoshoot") },
  { _id: "c2", title: "Second photoshoot", slug: "second-photoshoot", description: LOREM, cover: img("shoot-2", 2080, 1000, "Placeholder cover for the second photoshoot") },
];

export const photos: Photo[] = [
  { _id: "p1", image: img("photo-1", 1200, 1500, "Placeholder photo 1"), caption: "Placeholder caption", collectionId: "c1" },
  { _id: "p2", image: img("photo-2", 1500, 1000, "Placeholder photo 2"), collectionId: "c1" },
  { _id: "p3", image: img("photo-3", 1200, 1200, "Placeholder photo 3"), collectionId: "c1" },
  { _id: "p4", image: img("photo-4", 1000, 1500, "Placeholder photo 4"), caption: "Another placeholder caption", collectionId: "c2" },
  { _id: "p5", image: img("photo-5", 1500, 1000, "Placeholder photo 5"), collectionId: "c2" },
  { _id: "p6", image: img("photo-6", 1200, 1500, "Placeholder photo 6"), collectionId: "c2" },
];

// No placeholder videos: the page shows its empty state until one is added in the Studio.
export const videos: Video[] = [];

export const releases: Release[] = [
  {
    _id: "r1",
    title: "Looking For Love",
    cover: img("cover-1", 1000, 1000, "Placeholder cover for Looking For Love"),
    bandcamp:
      '<iframe src="https://bandcamp.com/EmbeddedPlayer/track=398471673/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/"><a href="https://fujideathcult.bandcamp.com/track/looking-for-love">Looking For Love by FUJIDEATHCULT</a></iframe>',
  },
  {
    _id: "r2",
    title: "Youth Service (demo)",
    cover: img("cover-2", 1000, 1000, "Placeholder cover for Youth Service (demo)"),
    bandcamp:
      '<iframe src="https://bandcamp.com/EmbeddedPlayer/track=4063750984/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/"><a href="https://fujideathcult.bandcamp.com/track/youth-service-demo">Youth Service (demo) by FUJIDEATHCULT</a></iframe>',
  },
];

/**
 * Default privacy policy, used until the artist writes their own in the
 * Studio. Covers what the brief requires: what the form collects, why, that
 * it's emailed and not stored, and that analytics are cookieless.
 */
export const privacy: PrivacyPage = {
  heading: "Privacy Policy",
  seoDescription: "How this website handles your personal information.",
  body: blocks(
    "This page explains what information this website collects and how it's used.",
    "## Contact form",
    "When you use the contact form, it collects your name, your email address, the type of enquiry and your message. This information is used only to reply to your enquiry.",
    "Your message is sent by email to the site owner, and you receive an automatic confirmation email. The website does not store your message in a database. It is kept only in the site owner's email inbox, and is deleted on request.",
    "Emails are delivered by Resend, an email service provider. The form is protected from spam by Cloudflare Turnstile, which checks that the form is being used by a person.",
    "## Analytics",
    "This website uses Cloudflare Web Analytics to count visits. It does not use cookies, does not track you across other websites, and does not collect personal information. Because of this, there is no cookie banner.",
    "## Embedded content",
    "Videos and music players from YouTube, Vimeo and Bandcamp only load after you click to play them. Once loaded, those services may collect data under their own privacy policies.",
    "## Your rights",
    "To ask what information is held about you, or to have it deleted, contact the site owner using the contact form or by replying to any email you have received.",
  ),
};
