import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CampusPages";

export const Route = createFileRoute("/categoria/$slug")({
  head: () => ({ meta: [
    { title: "Categoria — InfoCampus" },
    { name: "description", content: "Notícias por categoria no InfoCampus." },
    { property: "og:title", content: "Categoria — InfoCampus" },
    { property: "og:description", content: "Notícias por categoria no InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CategoryPage slug={Route.useParams().slug} />,
});
