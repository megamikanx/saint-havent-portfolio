import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageWithAlt } from "../lib/fields";

const PLATFORMS = [
  { title: "Instagram", value: "instagram" },
  { title: "YouTube", value: "youtube" },
  { title: "Vimeo", value: "vimeo" },
  { title: "Bandcamp", value: "bandcamp" },
  { title: "Spotify", value: "spotify" },
  { title: "Apple Music", value: "appleMusic" },
  { title: "SoundCloud", value: "soundcloud" },
  { title: "TikTok", value: "tiktok" },
  { title: "X (Twitter)", value: "x" },
  { title: "Facebook", value: "facebook" },
  { title: "Email", value: "email" },
  { title: "Other", value: "other" },
];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "title",
      title: "Site title",
      description: "Your name or brand. Shown in the header, browser tabs and search results.",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "ownerName",
      title: "Your name (for the © line)",
      description: "Shown in the footer of every page, e.g. \"© 2026 Joel Goh\". If empty, the site title is used.",
      type: "string",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "description",
      title: "Default search engine description",
      description:
        "One or two sentences describing you and your work. Used in Google results and link previews when a page doesn't have its own description.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(160).warning("Search engines cut descriptions off after about 160 characters."),
    }),
    imageWithAlt({
      name: "logo",
      title: "Logo",
      description:
        "Optional. Your logo, shown at the top of every page. A transparent PNG or SVG works best. If empty, the site title is shown instead.",
    }),
    imageWithAlt({
      name: "shareImage",
      title: "Default share image",
      description:
        "The image shown when someone shares a link to your site on social media or in a message. Best size: 1200 × 630 pixels (landscape).",
    }),
    defineField({
      name: "socialLinks",
      title: "Social and streaming links",
      description: "Shown in the footer of every page and on the About page. Drag to reorder.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          title: "Link",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              description: "Which service this link goes to.",
              type: "string",
              options: { list: PLATFORMS },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Link",
              description: "The full web address, starting with https:// (or mailto: for an email address).",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https", "http", "mailto"] }),
            }),
            defineField({
              name: "label",
              title: "Custom label",
              description: "Optional. Replaces the platform name, e.g. \"Band Instagram\". Needed if you chose Other.",
              type: "string",
              validation: (rule) =>
                rule.custom((label, ctx) =>
                  (ctx.parent as { platform?: string })?.platform === "other" && !label ? "Add a label for \"Other\" links." : true,
                ),
            }),
          ],
          preview: { select: { title: "label", subtitle: "url", platform: "platform" }, prepare: ({ title, subtitle, platform }) => ({ title: title || PLATFORMS.find((p) => p.value === platform)?.title || "Link", subtitle }) },
        }),
      ],
    }),
    defineField({
      name: "notificationEmail",
      title: "Contact form email address",
      description:
        "Where messages from the contact form are sent. Not shown on the website. If left empty, the address set up by your developer is used.",
      type: "email",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
