import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/CampusPages";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [
    { title: "Configurações — InfoCampus" },
    { name: "description", content: "Atualize seu perfil no InfoCampus." },
    { property: "og:title", content: "Configurações — InfoCampus" },
    { property: "og:description", content: "Atualize seu perfil no InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <SettingsPage />,
});
