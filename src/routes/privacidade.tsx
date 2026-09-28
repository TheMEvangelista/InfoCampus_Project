import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/CampusPages";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [
    { title: "Privacidade — InfoCampus" },
    { name: "description", content: "Informações sobre privacidade no InfoCampus." },
    { property: "og:title", content: "Privacidade — InfoCampus" },
    { property: "og:description", content: "Informações sobre privacidade no InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <LegalPage kind="privacidade" />,
});
