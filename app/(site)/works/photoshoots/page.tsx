import ProjectList from "@/app/components/project-list";

export default function Photoshoots() {
  return (
    <ProjectList
      title="Photoshoots"
      category="photoshoots"
      placeholders={["Lorem ipsum placeholder this is for first photoshoot.", "This is for second photoshoot."]}
    />
  );
}
