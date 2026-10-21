import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ArticleCard, Empty, PostCard, SectionHeading } from "@/components/CampusContent";
import { useAuth, useProfile } from "@/lib/auth";
import { safeUrl } from "@/lib/url";
import { supabase } from "@/integrations/supabase/client";
import { dateLong } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useCampusData } from "@/hooks/useCampusData";

export function ProfilePage({ username }: { username: string }) {
  const { user } = useAuth();
  const { data: self } = useProfile();
  const { posts, articles } = useCampusData();
  const { data: profile } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  return (
    <AppShell>
      {!profile ? (
        <Empty text="Perfil não encontrado." />
      ) : (
        <>
          <div className="border-b border-border pb-7">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-2xl font-bold text-primary-deep">
                {safeUrl(profile.avatar_url) ? (
                  <img
                    src={safeUrl(profile.avatar_url)!}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.full_name[0]
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold">{profile.full_name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                <p className="mt-2 text-sm">{profile.bio}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Na comunidade desde {dateLong(profile.created_at)}
                </p>
              </div>
              {self?.id === profile.id ? (
                <Button asChild variant="outline">
                  <Link to="/configuracoes">Editar perfil</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/mensagens" search={{ para: profile.username }}>
                    Enviar mensagem
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <section className="mt-8">
            <SectionHeading title="PublicaÃ§ões" />
            <div className="space-y-4">
              {posts.data
                ?.filter((p) => p.author_id === profile.id)
                .map((p) => (
                  <PostCard post={p} key={p.id} />
                ))}
              {posts.data?.filter((p) => p.author_id === profile.id).length === 0 && <Empty />}
            </div>
          </section>
          <section className="mt-8">
            <SectionHeading title="Artigos" />
            <div className="grid gap-4 sm:grid-cols-2">
              {articles.data
                ?.filter((a) => a.author_id === profile.id)
                .map((a) => (
                  <ArticleCard article={a} key={a.id} />
                ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
