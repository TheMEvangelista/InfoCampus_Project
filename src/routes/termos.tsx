import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/CampusPages";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [
    { title: "Termos de uso — InfoCampus" },
    { name: "description", content: "Termos de uso da comunidade InfoCampus." },
    { property: "og:title", content: "Termos de uso — InfoCampus" },
    { property: "og:description", content: "Termos de uso da comunidade InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <LegalPage kind="termos" />,
});
