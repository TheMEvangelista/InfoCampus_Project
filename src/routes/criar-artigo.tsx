import { createFileRoute } from "@tanstack/react-router";
import { WriteArticlePage } from "@/components/CampusPages";

export const Route = createFileRoute("/criar-artigo")({
  head: () => ({ meta: [
    { title: "Escrever artigo — InfoCampus" },
    { name: "description", content: "Publique um artigo para a comunidade do IFMA." },
    { property: "og:title", content: "Escrever artigo — InfoCampus" },
    { property: "og:description", content: "Publique um artigo para a comunidade do IFMA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <WriteArticlePage />,
});
