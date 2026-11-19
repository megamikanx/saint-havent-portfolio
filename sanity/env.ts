export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-11-01";

// False until the env vars are set, so the site falls back to placeholders.
export const isSanityConfigured = projectId.length > 0;
