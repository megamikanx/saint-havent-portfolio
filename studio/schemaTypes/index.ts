import { siteSettings } from "./documents/siteSettings";
import { aboutPage, contactPage, homePage, musicPage, photographyPage, privacyPage, videographyPage } from "./documents/pages";
import { collection, photo, release, video } from "./documents/media";

export const schemaTypes = [
  siteSettings,
  homePage,
  aboutPage,
  photographyPage,
  videographyPage,
  musicPage,
  contactPage,
  privacyPage,
  photo,
  collection,
  video,
  release,
];

/** Document types that exist exactly once. Their document ID equals the type name. */
export const SINGLETONS = new Set([
  "siteSettings",
  "homePage",
  "aboutPage",
  "photographyPage",
  "videographyPage",
  "musicPage",
  "contactPage",
  "privacyPage",
]);
