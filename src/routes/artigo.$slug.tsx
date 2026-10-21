import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage } from "@/components/CampusPages/ArticlePage";

export const Route = createFileRoute("/artigo/$slug")({
  head: () => ({
    meta: [
      { title: "Artigo — InfoCampus" },
      { name: "description", content: "Leia um artigo da comunidade do IFMA." },
      { property: "og:title", content: "Artigo — InfoCampus" },
      { property: "og:description", content: "Leia um artigo da comunidade do IFMA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticleRoute,
});

function ArticleRoute() {
  const { slug } = Route.useParams();
  return <ArticlePage slug={slug} />;
}
