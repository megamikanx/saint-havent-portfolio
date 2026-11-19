import Image from "next/image";
import { notFound } from "next/navigation";
import { getProject, imageUrl } from "@/sanity/client";
import { isSanityConfigured } from "@/sanity/env";

type Props = {
  category: string;
  slug: string;
};

export default async function ProjectDetail({ category, slug }: Props) {
  const project = await getProject(category, slug);

  if (!project) {
    // Before Sanity is connected, keep the old placeholder page instead of a 404.
    if (!isSanityConfigured) {
      return (
        <main className="px-8 py-10">
          <h1 className="mb-6 text-4xl">{slug}</h1>
          <p>Project details will appear here once Sanity is connected.</p>
        </main>
      );
    }
    notFound();
  }

  const images = [project.coverImage, ...(project.gallery ?? [])].filter(
    (img) => img?.asset,
  );

  return (
    <main className="px-8 py-10">
      <h1 className="mb-6 text-4xl">{project.title}</h1>
      {project.description && <p className="mb-10 max-w-2xl">{project.description}</p>}

      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        {images.map((img, i) => (
          <Image
            key={img?.asset?._ref ?? i}
            src={imageUrl(img, 1800)}
            alt={img?.alt ?? project.title}
            width={1800}
            height={1200}
            sizes="(min-width: 896px) 896px, 100vw"
            className="h-auto w-full"
          />
        ))}
      </div>
    </main>
  );
}
