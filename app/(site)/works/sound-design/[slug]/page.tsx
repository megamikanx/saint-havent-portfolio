import ProjectDetail from "@/app/components/project-detail";

export default async function SoundDesignProject({ params }: PageProps<"/works/sound-design/[slug]">) {
  const { slug } = await params;
  return <ProjectDetail category="sound-design" slug={slug} />;
}
