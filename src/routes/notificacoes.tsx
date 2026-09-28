import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/CampusPages";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({ meta: [
    { title: "Notificações — InfoCampus" },
    { name: "description", content: "Novidades da sua comunidade no InfoCampus." },
    { property: "og:title", content: "Notificações — InfoCampus" },
    { property: "og:description", content: "Novidades da sua comunidade no InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <NotificationsPage />,
});
