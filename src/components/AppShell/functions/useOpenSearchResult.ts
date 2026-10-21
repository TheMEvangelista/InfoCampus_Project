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

    const people = await supabase
      .from("profiles")
      .select("username")
      .ilike("full_name", query)
      .limit(2);
    const person = people.data?.[0];
    if (people.data?.length === 1 && person?.username) {
      navigate({ to: "/perfil/$username", params: { username: person.username } });
      onComplete();
      return;
    }

    const articles = await supabase
      .from("articles")
      .select("slug")
      .eq("published", true)
      .ilike("title", query)
      .limit(2);
    const article = articles.data?.[0];
    if (articles.data?.length === 1 && article?.slug) {
      navigate({ to: "/artigo/$slug", params: { slug: article.slug } });
    } else {
      navigate({ to: "/buscar", search: { q: query, tipo: "artigos", pagina: 1 } });
    }
    onComplete();
  };
}
