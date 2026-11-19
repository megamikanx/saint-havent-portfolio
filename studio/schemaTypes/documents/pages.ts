/**
 * One document per website page. Each is a "singleton": there's exactly one
 * Home page, one About page, etc. (see SINGLETONS in sanity.config.ts).
 */
import type { ComponentType } from "react";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { HomeIcon } from "@sanity/icons/Home";
import { ImagesIcon } from "@sanity/icons/Images";
import { LockIcon } from "@sanity/icons/Lock";
import { MicrophoneIcon as MusicIcon } from "@sanity/icons/Microphone";
import { PlayIcon } from "@sanity/icons/Play";
import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageWithAlt, pageFields } from "../lib/fields";

function simplePage(name: string, title: string, icon: ComponentType) {
  return defineType({
    name,
    title,
    type: "document",
    icon,
    fields: pageFields(),
    preview: { prepare: () => ({ title }) },
  });
}

export const homePage = simplePage("homePage", "Home page", HomeIcon);
export const photographyPage = simplePage("photographyPage", "Photography page", ImagesIcon);
export const videographyPage = simplePage("videographyPage", "Videography page", PlayIcon);
export const musicPage = simplePage("musicPage", "Music page", MusicIcon);
export const contactPage = simplePage("contactPage", "Contact page", EnvelopeIcon);

/** Rich text with only the basics: paragraphs, subheadings, bold, italic, links and lists. */
const richText = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: "array",
    of: [
      defineArrayMember({
        type: "block",
        styles: [
          { title: "Paragraph", value: "normal" },
          { title: "Subheading", value: "h2" },
        ],
        lists: [
          { title: "Bullet list", value: "bullet" },
          { title: "Numbered list", value: "number" },
        ],
        marks: {
          decorators: [
            { title: "Bold", value: "strong" },
            { title: "Italic", value: "em" },
          ],
          annotations: [
            {
              name: "link",
              type: "object",
              title: "Link",
              fields: [
                {
                  name: "href",
                  type: "url",
                  title: "Link address",
                  description: "The full web address, starting with https://",
                  validation: (rule) => rule.uri({ scheme: ["https", "http", "mailto"] }),
                },
              ],
            },
          ],
        },
      }),
    ],
  });

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  icon: UserIcon,
  fields: [
    ...pageFields(),
    richText("bio", "Bio", "Your biography. Use Subheading for section titles. Keep paragraphs short so it's easy to read on a phone."),
    imageWithAlt({
      name: "portrait",
      title: "Portrait",
      description: "A photo of you, shown next to your bio. Portrait (tall) photos work best. Click Edit (the crop icon) to choose the focal point.",
    }),
  ],
  preview: { prepare: () => ({ title: "About page" }) },
});

export const privacyPage = defineType({
  name: "privacyPage",
  title: "Privacy Policy",
  type: "document",
  icon: LockIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Page heading",
      description: "The title at the top of the page, usually \"Privacy Policy\".",
      type: "string",
      initialValue: "Privacy Policy",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "Search engine description",
      description: "Shown in Google results. One short sentence is enough.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(160),
    }),
    richText(
      "body",
      "Policy text",
      "Leave empty to use the built-in policy, which explains that the contact form collects name, email and message, uses them only to reply, emails them without storing them, and that analytics are cookieless. If you write your own, keep those points.",
    ),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      description: "The date you last changed the policy. Shown at the top of the page. If empty, the last edit date is used.",
      type: "date",
    }),
  ],
  preview: { prepare: () => ({ title: "Privacy Policy", media: DocumentTextIcon }) },
});
