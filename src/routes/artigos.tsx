import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/CampusPages";

export const Route = createFileRoute("/artigos")({
  head: () => ({ meta: [
    { title: "Artigos — InfoCampus" },
    { name: "description", content: "Ideias e histórias dos estudantes do IFMA." },
    { property: "og:title", content: "Artigos — InfoCampus" },
    { property: "og:description", content: "Ideias e histórias dos estudantes do IFMA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ListingPage kind="artigos" />,
});
