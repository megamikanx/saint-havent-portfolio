/**
 * The artist's work: photos (optionally grouped into collections), videos and
 * music releases. Every list is manually ordered by dragging in the Studio
 * (via @sanity/orderable-document-list and its hidden orderRank field).
 */
import { FolderIcon } from "@sanity/icons/Folder";
import { ImageIcon } from "@sanity/icons/Image";
import { MicrophoneIcon as MusicIcon } from "@sanity/icons/Microphone";
import { PlayIcon } from "@sanity/icons/Play";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";
import { imageWithAlt } from "../lib/fields";
import { isSupportedBandcamp, isSupportedVideoUrl } from "../lib/embeds";

export const collection = defineType({
  name: "collection",
  title: "Photo collection",
  type: "document",
  icon: FolderIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "collection" }),
    defineField({
      name: "title",
      title: "Collection name",
      description: "Shown as a heading above the photos on the Photography page, e.g. \"Tour 2026\" or \"Portraits\".",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Optional. A sentence or two about the series, shown under its name.",
      type: "text",
      rows: 3,
    }),
  ],
});

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  icon: ImageIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "photo" }),
    imageWithAlt({
      name: "image",
      title: "Photo",
      description:
        "Upload the highest-quality version you have (JPEG or PNG). The website automatically makes smaller, faster versions. Click Edit (the crop icon) to set the focal point used for thumbnails.",
      required: true,
    }),
    defineField({
      name: "caption",
      title: "Caption",
      description: "Optional. Shown under the photo, e.g. the subject, location or client.",
      type: "string",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "collection",
      title: "Collection",
      description: "Optional. Group this photo into a series. Photos without a collection appear at the end of the Photography page.",
      type: "reference",
      to: [{ type: "collection" }],
    }),
  ],
  preview: {
    select: { title: "caption", alt: "image.alt", media: "image", collection: "collection.title" },
    prepare: ({ title, alt, media, collection }) => ({ title: title || alt || "Untitled photo", subtitle: collection, media }),
  },
});

export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  icon: PlayIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "video" }),
    defineField({
      name: "title",
      title: "Title",
      description: "Shown under the video on the Videography page.",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "url",
      title: "YouTube or Vimeo link",
      description:
        "Copy the link from your browser's address bar or the Share button, e.g. https://www.youtube.com/watch?v=… or https://vimeo.com/123456789. The player is created automatically.",
      type: "url",
      validation: (rule) =>
        rule.required().custom((url: string | undefined) =>
          !url || isSupportedVideoUrl(url) ? true : "This doesn't look like a YouTube or Vimeo video link. Copy the link from the video's page or Share button.",
        ),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Optional. A sentence or two about the video, e.g. the artist, client or your role.",
      type: "text",
      rows: 3,
    }),
  ],
  preview: { select: { title: "title", subtitle: "url" } },
});

export const release = defineType({
  name: "release",
  title: "Music release",
  type: "document",
  icon: MusicIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "release" }),
    defineField({
      name: "title",
      title: "Title",
      description: "The name of the album, EP or track.",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "year",
      title: "Year",
      description: "The year it was released, e.g. 2026.",
      type: "number",
      validation: (rule) => rule.integer().min(1950).max(2100),
    }),
    imageWithAlt({
      name: "cover",
      title: "Cover art",
      description: "The square album or track artwork.",
      required: true,
    }),
    defineField({
      name: "bandcamp",
      title: "Bandcamp link or embed code",
      description:
        "Paste either the link to the album/track page (e.g. https://yourname.bandcamp.com/album/…) or the embed code from Bandcamp's Share / Embed button. The player is created automatically.",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule.required().custom((value: string | undefined) =>
          !value || isSupportedBandcamp(value)
            ? true
            : "Paste a Bandcamp album or track link (containing /album/ or /track/), or the embed code from Share / Embed.",
        ),
    }),
  ],
  preview: {
    select: { title: "title", year: "year", media: "cover" },
    prepare: ({ title, year, media }) => ({ title, subtitle: year ? String(year) : undefined, media }),
  },
});
