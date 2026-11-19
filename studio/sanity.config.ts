/**
 * Sanity Studio configuration. Deployed to <name>.sanity.studio with
 * `npm run deploy`. See the README and CMS-GUIDE.md.
 */
import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { CogIcon } from "@sanity/icons/Cog";
import { FolderIcon } from "@sanity/icons/Folder";
import { ImageIcon } from "@sanity/icons/Image";
import { MicrophoneIcon } from "@sanity/icons/Microphone";
import { PlayIcon } from "@sanity/icons/Play";
import { schemaTypes, SINGLETONS } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "missing-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.listItem().title(title).id(type).schemaType(type).child(S.document().schemaType(type).documentId(type).title(title));

/** The sidebar the artist sees, in plain-English sections. */
const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      singleton(S, "siteSettings", "Site settings").icon(CogIcon),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              singleton(S, "homePage", "Home"),
              singleton(S, "aboutPage", "About"),
              singleton(S, "photographyPage", "Photography"),
              singleton(S, "videographyPage", "Videography"),
              singleton(S, "musicPage", "Music"),
              singleton(S, "contactPage", "Contact"),
              singleton(S, "privacyPage", "Privacy Policy"),
            ]),
        ),
      S.divider(),
      // Drag-to-reorder lists. The order here is the order on the website.
      orderableDocumentListDeskItem({ type: "photo", title: "Photos", icon: ImageIcon, S, context }),
      orderableDocumentListDeskItem({ type: "collection", title: "Photo collections", icon: FolderIcon, S, context }),
      orderableDocumentListDeskItem({ type: "video", title: "Videos", icon: PlayIcon, S, context }),
      orderableDocumentListDeskItem({ type: "release", title: "Music releases", icon: MicrophoneIcon, S, context }),
    ]);

export default defineConfig({
  name: "default",
  title: "Saint Haven't",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Singletons can't be created again from the "+ Create" menu…
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },
  document: {
    // …and can't be deleted or duplicated.
    actions: (actions, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : actions,
  },
});
