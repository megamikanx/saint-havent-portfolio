import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "heroImages",
      title: "Hero images",
      description: "The two images at the top of the home page (left, then right).",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
        },
      ],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "bio",
      type: "text",
      rows: 4,
    }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
