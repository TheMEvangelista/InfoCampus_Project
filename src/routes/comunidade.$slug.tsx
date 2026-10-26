import { createFileRoute } from "@tanstack/react-router";
import { CommunityPage } from "@/components/CampusPages/CommunityPage";

export const Route = createFileRoute("/comunidade/$slug")({
  head: () => ({ meta: [{ title: "Comunidade — InfoCampus" }, { name: "description", content: "Participe das comunidades acadêmicas do InfoCampus." }] }),
  component: () => <CommunityPage slug={Route.useParams().slug} />,
});
