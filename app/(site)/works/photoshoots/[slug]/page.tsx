import ProjectDetail from "@/app/components/project-detail";

export default async function PhotoshootProject({ params }: PageProps<"/works/photoshoots/[slug]">) {
  const { slug } = await params;
  return <ProjectDetail category="photoshoots" slug={slug} />;
}
