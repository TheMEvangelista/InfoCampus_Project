import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/CampusPages";

export const Route = createFileRoute("/perfil/$username")({
  head: () => ({ meta: [
    { title: "Perfil — InfoCampus" },
    { name: "description", content: "Perfil de estudante no InfoCampus." },
    { property: "og:title", content: "Perfil — InfoCampus" },
    { property: "og:description", content: "Perfil de estudante no InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ProfilePage username={Route.useParams().username} />,
});
