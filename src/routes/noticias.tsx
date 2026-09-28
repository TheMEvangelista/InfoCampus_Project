import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/CampusPages";

export const Route = createFileRoute("/noticias")({
  head: () => ({ meta: [
    { title: "Notícias — InfoCampus" },
    { name: "description", content: "Notícias e artigos recentes da comunidade do IFMA." },
    { property: "og:title", content: "Notícias — InfoCampus" },
    { property: "og:description", content: "Notícias e artigos recentes da comunidade do IFMA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ListingPage kind="noticias" />,
});
