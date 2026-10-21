import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Empty, PageHeading, SectionHeading } from "@/components/CampusContent";
import { content } from "@/lib/content";
import { useAuth, useIsStaff } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { dateLong } from "@/lib/format";
import { Button } from "@/components/UI/button";
import { useCampusData } from "@/hooks/useCampusData";
import { LoginPrompt } from "./LoginPrompt";

type PendingArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string;
  created_at: string;
  featured: boolean;
  profiles: { full_name: string; username: string } | null;
};

export function AdminPage() {
  const { user } = useAuth();
  const { data: isStaff } = useIsStaff();
  const { articles, posts, communities } = useCampusData();
  const queryClient = useQueryClient();
  const pending = useQuery({
    queryKey: ["pending-articles"],
    enabled: !!isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id,slug,title,subtitle,content,created_at,featured,profiles!articles_author_id_fkey(full_name,username)",
        )
        .eq("published", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PendingArticle[];
    },
  });
  async function review(id: string, action: "approve" | "feature" | "reject") {
    if (
      action === "reject" &&
      !window.confirm("Rejeitar e excluir este artigo? Essa ação não pode ser desfeita.")
    )
      return;
    const { error } =
      action === "reject"
        ? await supabase.from("articles").delete().eq("id", id)
        : await supabase
            .from("articles")
            .update(
              action === "feature" ? { published: true, featured: true } : { published: true },
            )
            .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(action === "reject" ? "Artigo rejeitado." : "Artigo publicado!");
    queryClient.invalidateQueries({ queryKey: ["pending-articles"] });
    queryClient.invalidateQueries({ queryKey: ["articles"] });
  }
  return (
    <AppShell>
      <PageHeading title="Painel admin" subtitle="Visão geral da comunidade." />
      {!user ? (
        <LoginPrompt />
      ) : isStaff ? (
        <div className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Artigos", articles.data?.length],
              ["PublicaÃ§ões", posts.data?.length],
              ["Comunidades", communities.data?.length],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-md border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-extrabold text-primary-deep">{value ?? "â€”"}</p>
              </div>
            ))}
          </div>
          <section>
            <SectionHeading
              title={`Artigos pendentes${pending.data ? ` (${pending.data.length})` : ""}`}
            />
            <div className="space-y-4">
              {pending.data?.map((a) => (
                <div key={a.id} className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-base font-bold">{a.title}</h3>
                  {a.subtitle && <p className="mt-1 text-sm text-muted-foreground">{a.subtitle}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Por {a.profiles?.full_name ?? "Autor desconhecido"} · {dateLong(a.created_at)}
                  </p>
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-semibold text-primary-deep">
                      Ver conteúdo
                    </summary>
                    <div className="mt-2 whitespace-pre-line leading-7">{a.content}</div>
                  </details>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => review(a.id, "approve")}>
                      Aprovar
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => review(a.id, "feature")}>
                      Aprovar e destacar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => review(a.id, "reject")}>
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
              {pending.data?.length === 0 && <Empty text="Nenhum artigo aguardando revisão." />}
              {pending.isError && <Empty text="Não foi possível carregar os artigos pendentes." />}
            </div>
          </section>
        </div>
      ) : (
        <Empty text="Você não tem permissão para acessar este painel." />
      )}
    </AppShell>
  );
}
