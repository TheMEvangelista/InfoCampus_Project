import { createFileRoute } from "@tanstack/react-router";
import { MessagesPage } from "@/components/CampusPage/MessagesPage";

export const Route = createFileRoute("/mensagens")({
  validateSearch: (search: Record<string, unknown>) => ({
    para: typeof search["para"] === "string" ? search["para"].slice(0, 40) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mensagens — InfoCampus" },
      { name: "description", content: "Suas conversas no InfoCampus." },
      { property: "og:title", content: "Mensagens — InfoCampus" },
      { property: "og:description", content: "Suas conversas no InfoCampus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});
