import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";
import { isSanityConfigured } from "../../../sanity/env";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="mb-4 text-2xl">Sanity isn&apos;t connected yet</h1>
        <p>
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in <code>.env.local</code>{" "}
          (see <code>.env.example</code>) and restart the dev server.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
