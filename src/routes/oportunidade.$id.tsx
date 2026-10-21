import { createFileRoute } from "@tanstack/react-router";
import { OpportunityPage } from "@/components/CampusPages/OpportunityPage";

export const Route = createFileRoute("/oportunidade/$id")({
  head: () => ({
    meta: [
      { title: "Oportunidade — InfoCampus" },
      { name: "description", content: "Confira detalhes sobre esta oportunidade no IFMA." },
      { property: "og:title", content: "Oportunidade — InfoCampus" },
      { property: "og:description", content: "Confira detalhes sobre esta oportunidade no IFMA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunityRoute,
});

function OpportunityRoute() {
  const { id } = Route.useParams();
  return <OpportunityPage id={id} />;
}
