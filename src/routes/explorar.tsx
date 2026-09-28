import { createFileRoute } from "@tanstack/react-router";
import { ExplorePage } from "@/components/CampusPages";

export const Route = createFileRoute("/explorar")({
  head: () => ({ meta: [
    { title: "Explorar — InfoCampus" },
    { name: "description", content: "Descubra notícias, publicações e comunidades do IFMA." },
    { property: "og:title", content: "Explorar — InfoCampus" },
    { property: "og:description", content: "Descubra notícias, publicações e comunidades do IFMA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ExplorePage />,
});
