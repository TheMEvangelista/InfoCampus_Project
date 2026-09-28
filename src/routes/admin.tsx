import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/CampusPages";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Painel admin — InfoCampus" },
    { name: "description", content: "Visão geral da comunidade InfoCampus." },
    { property: "og:title", content: "Painel admin — InfoCampus" },
    { property: "og:description", content: "Visão geral da comunidade InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AdminPage />,
});
