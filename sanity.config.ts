"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { CATEGORIES } from "./sanity/schemaTypes/project";

export default defineConfig({
  basePath: "/studio",
  title: "Saint Haven't",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Home page is a single document: hide it from the "create new" menu.
    templates: (templates) => [
      ...templates.filter((t) => t.schemaType !== "homePage"),
      // Pre-fills the category when "+" is clicked inside a category list.
      {
        id: "project-in-category",
        title: "Project in category",
        schemaType: "project",
        parameters: [{ name: "category", type: "string" }],
        value: (params: { category: string }) => ({ category: params.category }),
      },
    ],
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Home page")
              .id("homePage")
              .child(S.document().schemaType("homePage").documentId("homePage")),
            S.divider(),
            ...CATEGORIES.map((c) =>
              S.listItem()
                .title(c.title)
                .id(c.value)
                .child(
                  S.documentList()
                    .title(c.title)
                    .schemaType("project")
                    .filter('_type == "project" && category == $category')
                    .params({ category: c.value })
                    .defaultOrdering([{ field: "order", direction: "asc" }])
                    .initialValueTemplates([
                      S.initialValueTemplateItem("project-in-category", { category: c.value }),
                    ]),
                ),
            ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
