import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { normalizeSearch } from "@/lib/search";

export function useOpenSearchResult(term: string, onComplete: () => void) {
  const navigate = useNavigate();

  return async function openSearchResult() {
    const query = normalizeSearch(term);
    if (!query) return;

    const exact = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", query.replace(/^@/, ""))
      .maybeSingle();
    if (exact.data?.username) {
      navigate({ to: "/perfil/$username", params: { username: exact.data.username } });
      onComplete();
      return;
    }

    navigate({ to: "/buscar", search: { q: query, tipo: "artigos", pagina: 1 } });
    onComplete();
  };
}
