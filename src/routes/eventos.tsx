import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/CampusPages";

export const Route = createFileRoute("/eventos")({
  head: () => ({ meta: [
    { title: "Eventos — InfoCampus" },
    { name: "description", content: "Encontros e atividades da comunidade do IFMA." },
    { property: "og:title", content: "Eventos — InfoCampus" },
    { property: "og:description", content: "Encontros e atividades da comunidade do IFMA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ListingPage kind="eventos" />,
});
