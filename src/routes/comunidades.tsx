import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/CampusPages";

export const Route = createFileRoute("/comunidades")({
  head: () => ({ meta: [
    { title: "Comunidades — InfoCampus" },
    { name: "description", content: "Explore as comunidades de estudantes do IFMA." },
    { property: "og:title", content: "Comunidades — InfoCampus" },
    { property: "og:description", content: "Explore as comunidades de estudantes do IFMA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ListingPage kind="comunidades" />,
});
