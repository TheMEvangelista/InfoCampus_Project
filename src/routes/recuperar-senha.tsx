import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/components/CampusPages";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [
    { title: "Recuperar senha — InfoCampus" },
    { name: "description", content: "Recupere o acesso à sua conta InfoCampus." },
    { property: "og:title", content: "Recuperar senha — InfoCampus" },
    { property: "og:description", content: "Recupere o acesso à sua conta InfoCampus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ResetPasswordPage />,
});
