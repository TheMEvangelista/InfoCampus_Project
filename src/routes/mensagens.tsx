import { createFileRoute } from "@tanstack/react-router";
import { MessagesPage } from "@/components/CampusPages";

export const Route = createFileRoute("/mensagens")({
  head: () => ({ meta: [
    { title: "Mensagens — InfoCampus" },
    { name: "description", content: "Suas conversas no InfoCampus." },
    { property: "og:title", content: "Mensagens — InfoCampus" },
    { property: "og:description", content: "Suas conversas no InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <MessagesPage />,
});
