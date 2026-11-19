import ProjectDetail from "@/app/components/project-detail";

export default async function BandProject({ params }: PageProps<"/works/band/[slug]">) {
  const { slug } = await params;
  return <ProjectDetail category="band" slug={slug} />;
}
