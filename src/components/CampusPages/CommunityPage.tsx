import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/CampusContent/PostCard";
import { Composer } from "@/components/CampusContent/Composer";
import { BackButton } from "@/components/CampusContent/BackButton";
import { useCampusData } from "@/hooks/useCampusData";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { safeUrl } from "@/lib/url";
import { Button } from "@/components/UI/button";

export function CommunityPage({ slug }: { slug: string }) {
  const { communities, posts } = useCampusData();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [sort, setSort] = useState<"recentes" | "populares">("recentes");
  const community = communities.data?.find((item) => item.slug === slug);
  const member = !!community?.community_members.some((item) => item.user_id === user?.id);
  const communityPosts = (posts.data ?? [])
    .filter((post) => post.community_id === community?.id)
    .sort((a, b) =>
      sort === "populares"
        ? b.post_likes.length - a.post_likes.length
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  async function toggleMembership() {
    if (!user) return toast.error("Entre na sua conta para participar.");
    if (!community) return;
    setBusy(true);
    const result = member
      ? await supabase
          .from("community_members")
          .delete()
          .eq("community_id", community.id)
          .eq("user_id", user.id)
      : await supabase
          .from("community_members")
          .insert({ community_id: community.id, user_id: user.id });
    setBusy(false);
    if (result.error) return toast.error(result.error.message);
    await queryClient.invalidateQueries({ queryKey: ["communities"] });
    toast.success(member ? "Você saiu da comunidade." : "Você entrou na comunidade!");
  }

  if (communities.isLoading)
    return (
      <AppShell>
        <p className="py-16 text-center text-muted-foreground">Carregando comunidade...</p>
      </AppShell>
    );
  if (!community)
    return (
      <AppShell>
        <div className="py-16 text-center">
          <h1 className="text-xl font-bold">Comunidade não encontrada</h1>
          <Link to="/comunidades" className="mt-3 inline-block text-primary underline">
            Voltar às comunidades
          </Link>
        </div>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5 pb-12">
        <BackButton fallbackTo="/comunidades" label="Voltar" />
        <section className="overflow-hidden rounded-md border border-border bg-card shadow-card">
          <div className="relative h-40 overflow-hidden bg-linear-to-br from-emerald-800 via-teal-700 to-sky-700 sm:h-56">
            {safeUrl(community.cover_url) && (
              <img
                src={safeUrl(community.cover_url)!}
                alt={`Capa da comunidade ${community.name}`}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />
          </div>
          <div className="px-5 pb-5 sm:px-7">
            <div className="-mt-8 relative mb-3 flex items-end justify-between gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-card bg-primary-soft text-primary-deep shadow-sm">
                <Users size={28} />
              </div>
              <Button
                disabled={busy}
                onClick={() => void toggleMembership()}
                variant={member ? "outline" : "default"}
              >
                {busy ? "Aguarde..." : member ? "Participando · Sair" : "Participar da comunidade"}
              </Button>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{community.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {community.description ||
                "Um espaço para estudantes compartilharem experiências, dúvidas e descobertas."}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users size={15} />
                {community.community_members.length}{" "}
                {community.community_members.length === 1 ? "membro" : "membros"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare size={15} />
                {communityPosts.length} publicações recentes
              </span>
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary-deep">
                Comunidade acadêmica
              </span>
            </div>
          </div>
        </section>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <main className="order-last min-w-0 space-y-4 lg:order-first">
            <Composer communityId={community.id} disabled={!member} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">
                Publicações{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({communityPosts.length})
                </span>
              </h2>
              <div
                className="flex gap-1 rounded-lg border border-border bg-card p-1"
                aria-label="Ordenar publicações"
              >
                {(["recentes", "populares"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={sort === option}
                    onClick={() => setSort(option)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${sort === option ? "bg-primary-soft text-primary-deep" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            {posts.isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Carregando publicações...
              </p>
            ) : communityPosts.length ? (
              communityPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center">
                <MessageSquare className="mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold">Ainda não há publicações</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seja a primeira pessoa a iniciar uma conversa nesta comunidade.
                </p>
              </div>
            )}
          </main>
          <aside className="order-first h-fit space-y-4 rounded-md border border-border bg-card p-5 shadow-card lg:sticky lg:top-5 lg:order-last">
            <h2 className="font-bold">Sobre esta comunidade</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {community.description || "Conecte-se com estudantes e participe das conversas."}
            </p>
            <div className="border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-bold">Membros</h3>
              <p className="text-sm text-muted-foreground">
                {community.community_members.length} participantes
              </p>
            </div>
            <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              Compartilhe conteúdos relevantes, respeite os outros membros e contribua para uma
              comunidade acolhedora.
            </p>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
