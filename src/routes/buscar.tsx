import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/components/SearchPage";
import { normalizeKind, normalizePage, normalizeSearch } from "@/lib/search";

export const Route = createFileRoute("/buscar")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: normalizeSearch(search.q),
    tipo: normalizeKind(search.tipo),
    pagina: normalizePage(search.pagina),
  }),
  head: () => ({ meta: [
    { title: "Buscar — InfoCampus" },
    { name: "description", content: "Pesquise notícias, artigos, pessoas e comunidades no InfoCampus." },
  ] }),
  component: SearchPage,
});
