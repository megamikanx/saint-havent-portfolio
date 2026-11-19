import { defineArrayMember, defineField, defineType } from "sanity";

export const CATEGORIES = [
  { title: "Photoshoots", value: "photoshoots" },
  { title: "Sound Design", value: "sound-design" },
  { title: "Band", value: "band" },
] as const;

const imageWithAlt = {
  type: "image" as const,
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Short description of the image for screen readers.",
    }),
  ],
};

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      options: { list: [...CATEGORIES], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      description: "Used in the page URL. Click Generate to make one from the title.",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      description: "Shown on the category page.",
      ...imageWithAlt,
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "gallery",
      description: "Extra images shown on the project's own page.",
      type: "array",
      of: [defineArrayMember(imageWithAlt)],
    }),
    defineField({
      name: "order",
      description: "Lower numbers show first.",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
