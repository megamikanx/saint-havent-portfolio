/**
 * Reusable field definitions, so every image asks for alt text the same way
 * and every page has the same heading / intro / SEO fields.
 */
import { defineField } from "sanity";

type ImageOptions = {
  name: string;
  title: string;
  description: string;
  required?: boolean;
  group?: string;
};

/** An image with hotspot cropping and required, validated alt text. */
export function imageWithAlt({ name, title, description, required = false, group }: ImageOptions) {
  return defineField({
    name,
    title,
    description,
    type: "image",
    group,
    options: { hotspot: true },
    validation: required ? (rule) => rule.required().assetRequired() : undefined,
    fields: [
      defineField({
        name: "alt",
        title: "Alt text (description for screen readers)",
        description:
          "Describe what's in the image for people who can't see it, in a short sentence. Example: \"Singer on stage under red lights, holding a microphone.\" Required.",
        type: "string",
        validation: (rule) =>
          rule.custom((alt, context) => {
            const parent = context.parent as { asset?: unknown } | undefined;
            if (!parent?.asset) return true; // No image uploaded yet.
            const value = (alt ?? "").trim();
            if (!value) return "Alt text is required. Describe what's in the image.";
            if (value.length < 5) return "Alt text is too short. Write a few words describing the image.";
            if (/\.(jpe?g|png|webp|gif|heic|tiff?)$/i.test(value) || /^(img|dsc|image)[-_ ]?\d+/i.test(value))
              return "This looks like a file name. Describe what's in the image instead.";
            return true;
          }),
      }),
    ],
  });
}

/** Heading, intro and SEO description shared by every editable page. */
export function pageFields() {
  return [
    defineField({
      name: "heading",
      title: "Page heading",
      description: "The large title at the top of the page.",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "intro",
      title: "Intro text",
      description: "A sentence or two shown under the heading. Optional.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: "seoDescription",
      title: "Search engine description",
      description:
        "Shown under the page title in Google results and when the page is shared. Aim for 1–2 sentences (under 160 characters). If left empty, the intro text is used.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(160).warning("Search engines cut descriptions off after about 160 characters."),
    }),
  ];
}
