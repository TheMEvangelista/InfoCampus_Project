import { useState, SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BackButton, Empty, SectionHeading, articleImage } from "@/components/CampusContent";
import { useAuth } from "@/lib/auth";
import { safeUrl } from "@/lib/url";
import { supabase } from "@/integrations/supabase/client";
import { dateLong } from "@/lib/format";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";

export function ArticlePage({ slug }: { slug: string }) {
  const { user } = useAuth();
  const { data: article } = useQuery({
    queryKey: ["article", slug, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id,slug,title,subtitle,content,cover_url,created_at,featured,tags,author_id,profiles!articles_author_id_fkey(id,username,full_name,avatar_url),categories(id,slug,name,description)",
        )
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const { data: comments } = useQuery({
    queryKey: ["article-comments", article?.id],
    enabled: !!article,
    queryFn: async () => {
      const { data } = await supabase
        .from("comments")
        .select("id,content,profiles(full_name,username,avatar_url)")
        .eq("article_id", article?.id ?? "")
        .order("created_at");
      return data ?? [];
    },
  });
  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!user) return toast.error("Entre para comentar.");
    if (!article || !comment.trim()) return;
    const { error } = await supabase
      .from("comments")
      .insert({ article_id: article.id, author_id: user.id, content: comment.trim() });
    if (error) toast.error(error.message);
    else {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["article-comments", article.id] });
      toast.success("Comentário enviado!");
    }
  }
  return (
    <AppShell>
      {!article ? (
        <Empty text="Artigo não encontrado." />
      ) : (
        <article className="mx-auto w-full max-w-7xl px-4 md:px-[8%]">
          <BackButton fallbackTo="/noticias" />
          <Link
            to="/categoria/$slug"
            params={{ slug: article.categories?.slug ?? "institucional" }}
            className="text-xs font-extrabold uppercase text-primary-deep"
          >
            {article.categories?.name}
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">{article.subtitle}</p>
          <p className="mt-5 text-xs text-muted-foreground">
            Por {article.profiles?.full_name ?? "InfoCampus"} · {dateLong(article.created_at)}
          </p>
          <img
            src={articleImage(article)}
            alt=""
            width={1280}
            height={720}
            className="mt-7 aspect-video w-full rounded-md object-cover"
          />
          <div className="mt-8 whitespace-pre-line text-base leading-8">{article.content}</div>
          <div className="mt-10 border-t border-border pt-6">
            <SectionHeading title="Comentários" />
            {comments?.map((c) => (
              <div
                key={c.id}
                className="mb-2 flex items-start gap-3 rounded-md bg-muted p-3 text-sm"
              >
                <Avatar className="h-9 w-9 shrink-0 rounded-full bg-primary-soft text-primary-deep ring-2 ring-primary/10">
                  <AvatarImage src={safeUrl(c.profiles?.avatar_url) ?? undefined} alt="" />
                  <AvatarFallback className="rounded-full bg-primary-soft font-semibold text-primary-deep">
                    {c.profiles?.full_name?.charAt(0) ?? "I"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  {c.profiles?.username ? (
                    <Link
                      to="/perfil/$username"
                      params={{ username: c.profiles.username }}
                      className="font-bold hover:text-primary-deep hover:underline"
                    >
                      {c.profiles.full_name ?? "Estudante"}
                    </Link>
                  ) : (
                    <b>{c.profiles?.full_name ?? "Estudante"}</b>
                  )}
                  <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))}
            <form onSubmit={submit} className="mt-4 flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-label="Comentário"
                placeholder="Deixe seu comentário..."
              />
              <Button type="submit" aria-label="Enviar comentário">
                <Send />
              </Button>
            </form>
          </div>
        </article>
      )}
    </AppShell>
  );
}
