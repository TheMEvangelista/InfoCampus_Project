import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/CampusPages";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "InfoCampus — comunidade acadêmica do IFMA" },
    { name: "description", content: "Notícias, eventos, oportunidades e conversas dos estudantes do IFMA." },
    { property: "og:title", content: "InfoCampus — comunidade acadêmica do IFMA" },
    { property: "og:description", content: "Notícias, eventos, oportunidades e conversas dos estudantes do IFMA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <HomePage />,
});
