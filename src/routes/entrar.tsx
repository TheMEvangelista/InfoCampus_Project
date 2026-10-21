import { createFileRoute } from "@tanstack/react-router";
import { EntrarPage } from "@/components/EntrarPage/EntrarPage";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — InfoCampus" },
      { name: "description", content: "Acesse o InfoCampus com seu e-mail institucional do IFMA." },
      { property: "og:title", content: "Entrar — InfoCampus" },
      {
        property: "og:description",
        content: "Acesse o InfoCampus com seu e-mail institucional do IFMA.",
      },
    ],
  }),
  component: EntrarPage,
});
