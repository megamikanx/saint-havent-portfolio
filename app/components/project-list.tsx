import Image from "next/image";
import Link from "next/link";
import { getProjects, imageUrl, PLACEHOLDER_IMAGE } from "@/sanity/client";

type Props = {
  title: string;
  category: string;
  /** Captions shown with the placeholder image until real projects exist in Sanity. */
  placeholders: string[];
};

export default async function ProjectList({ title, category, placeholders }: Props) {
  const projects = await getProjects(category);

  return (
    <main className="px-8 py-10">
      <h1 className="mb-10 text-4xl">{title}</h1>

      {projects.length > 0
        ? projects.map((project) => (
            <article key={project._id} className="mx-auto mb-16 max-w-4xl">
              <Link href={`/works/${category}/${project.slug}`} className="block">
                <div className="relative h-80 w-full border bg-neutral-100">
                  <Image
                    src={imageUrl(project.coverImage)}
                    alt={project.coverImage?.alt ?? project.title}
                    fill
                    sizes="(min-width: 896px) 896px, 100vw"
                    className="object-cover"
                  />
                </div>
              </Link>
              {project.description && (
                <p className="mx-auto mt-4 max-w-2xl text-center">{project.description}</p>
              )}
            </article>
          ))
        : placeholders.map((caption) => (
            <article key={caption} className="mx-auto mb-16 max-w-4xl">
              <div className="relative h-80 w-full border bg-neutral-100">
                <Image
                  src={PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  sizes="(min-width: 896px) 896px, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mx-auto mt-4 max-w-2xl text-center">{caption}</p>
            </article>
          ))}
    </main>
  );
}
