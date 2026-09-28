import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/CampusPages";

export const Route = createFileRoute("/oportunidades")({
  head: () => ({ meta: [
    { title: "Oportunidades — InfoCampus" },
    { name: "description", content: "Vagas, bolsas e projetos para estudantes do IFMA." },
    { property: "og:title", content: "Oportunidades — InfoCampus" },
    { property: "og:description", content: "Vagas, bolsas e projetos para estudantes do IFMA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ListingPage kind="oportunidades" />,
});
