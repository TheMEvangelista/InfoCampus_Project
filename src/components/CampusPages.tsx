import { useRef, useState, type SubmitEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Bell, ExternalLink, FileText, Paperclip, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  ArticleCard,
  BackButton,
  CommunityTile,
  Composer,
  Empty,
  EventRow,
  NewsArticleCard,
  OpportunityTile,
  PageHeading,
  PostCard,
  SectionHeading,
  articleImage,
} from "@/components/CampusContent";
import { content } from "@/lib/content";
import { useAuth, useIsStaff, useProfile } from "@/lib/auth";
import { isSafeHttpUrl, safeUrl } from "@/lib/url";
import { supabase } from "@/integrations/supabase/client";
import { dateLong } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCampusData } from "@/hooks/useCampusData";

export function ListingPage({
  kind,
}: {
  kind: "noticias" | "eventos" | "oportunidades" | "comunidades" | "artigos";
}) {
  const { articles: allArticles, events, opportunities, communities } = useCampusData();
  const q = String(
    (useRouterState({ select: (s) => s.location.search }) as { q?: string }).q ?? "",
  ).toLowerCase();
  const articles = {
    data: allArticles.data?.filter((a) =>
      `${a.title} ${a.subtitle ?? ""} ${a.tags.join(" ")}`.toLowerCase().includes(q),
    ),
  };
  const filteredOpportunities =
    opportunities.data?.filter(
      (o) =>
        !q || `${o.title} ${o.description} ${o.type} ${o.period ?? ""}`.toLowerCase().includes(q),
    ) ?? [];
  const config = (
    {
      noticias: ["Notícias", "Acompanhe o que acontece no IFMA."],
      eventos: ["Eventos", "Encontros, oficinas e atividades do campus."],
      oportunidades: ["Oportunidades", "Vagas, bolsas e projetos para dar o próximo passo."],
      comunidades: ["Comunidades", "Encontre pessoas com os mesmos interesses."],
      artigos: ["Artigos", "Ideias e histórias da nossa comunidade."],
    } as Record<string, [string, string]>
  )[kind]!;
  return (
    <AppShell>
      <BackButton fallbackTo="/" />
      <PageHeading title={config[0]} subtitle={config[1]} />
      {(kind === "noticias" || kind === "artigos") && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articles.data?.map((article) =>
            kind === "noticias" ? (
              <NewsArticleCard key={article.id} article={article} />
            ) : (
              <ArticleCard key={article.id} article={article} />
            ),
          )}
          {articles.data?.length === 0 && <Empty />}
        </div>
      )}
      {kind === "eventos" && (
        <div className="grid gap-4 md:grid-cols-2">
          {events.data?.map((e) => (
            <div key={e.id} className="rounded-md border border-border bg-card px-5 py-3">
              <EventRow event={e} />
              <p className="pb-2 text-xs text-muted-foreground">{dateLong(e.starts_at)}</p>
            </div>
          ))}
          {events.data?.length === 0 && <Empty />}
        </div>
      )}
      {kind === "oportunidades" && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOpportunities.map((o) => (
            <OpportunityTile item={o} key={o.id} />
          ))}
          {filteredOpportunities.length === 0 && <Empty text="Nenhuma oportunidade encontrada." />}
        </div>
      )}
      {kind === "comunidades" && (
        <div className="grid gap-3 md:grid-cols-2">
          {communities.data?.map((c) => (
            <CommunityTile community={c} key={c.id} />
          ))}
          {communities.data?.length === 0 && <Empty />}
        </div>
      )}
    </AppShell>
  );
}
export function CategoryPage({ slug }: { slug: string }) {
  const { articles, categories } = useCampusData();
  const category = categories.data?.find((c) => c.slug === slug);
  const filtered = articles.data?.filter((a) => a.categories?.slug === slug);
  return (
    <AppShell>
      <PageHeading
        title={category?.name ?? "Categoria"}
        subtitle={category?.description ?? undefined}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered?.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
        {filtered?.length === 0 && <Empty />}
      </div>
    </AppShell>
  );
}
export function ArticlePage({ slug }: { slug: string }) {
  const { data: articles } = useQuery({ queryKey: ["articles"], queryFn: content.articles });
  const article = articles?.find((a) => a.slug === slug);
  const { user } = useAuth();
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
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
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
export function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    const avatar = String(form.get("avatar_url") ?? "").trim();
    if (avatar && !isSafeHttpUrl(avatar))
      return toast.error("Link da foto inválido", {
        description: "Use um endereço que comece com http:// ou https://.",
      });
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(form.get("full_name") ?? ""),
        bio: String(form.get("bio") ?? ""),
        avatar_url: avatar || null,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Perfil atualizado!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  }
  return (
    <AppShell>
      <PageHeading title="ConfiguraÃ§ões" subtitle="Atualize suas informaÃ§ões de perfil." />
      {!user ? (
        <LoginPrompt />
      ) : (
        profile && (
          <form key={profile.id} onSubmit={save} className="max-w-xl space-y-4">
            <div>
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
            </div>
            <div>
              <Label htmlFor="bio">Sobre você</Label>
              <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} />
            </div>
            <div>
              <Label htmlFor="avatar_url">Link da foto de perfil</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                type="url"
                defaultValue={profile.avatar_url ?? ""}
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Salvando..." : "Salvar alteraÃ§ões"}
            </Button>
          </form>
        )
      )}
    </AppShell>
  );
}
export function LoginPrompt() {
  return (
    <div className="py-12 text-center">
      <p className="mb-4 text-sm text-muted-foreground">
        Entre na sua conta para acessar esta página.
      </p>
      <Button asChild>
        <Link to="/entrar">Entrar</Link>
      </Button>
    </div>
  );
}

export function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <AppShell>
      <PageHeading title="NotificaÃ§ões" subtitle="Novidades para você." />
      {!user ? (
        <LoginPrompt />
      ) : (
        <div className="space-y-3">
          {data?.map((n) => (
            <div
              key={n.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-4"
            >
              <Bell className="h-5 w-5 text-primary-deep" />
              <p className="flex-1 text-sm">{n.message}</p>
              {!n.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await supabase.from("notifications").update({ read: true }).eq("id", n.id);
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
                  }}
                >
                  Marcar como lida
                </Button>
              )}
            </div>
          ))}
          {data?.length === 0 && <Empty text="Nenhuma notificação por enquanto." />}
        </div>
      )}
    </AppShell>
  );
}
export function WriteArticlePage() {
  const { user } = useAuth();
  const { data: isStaff } = useIsStaff();
  const { data: ownProfile } = useProfile();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: content.categories });
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const slug = `${title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
    const cover = String(form.get("cover_url") ?? "").trim();
    if (cover && !isSafeHttpUrl(cover))
      return toast.error("Link da capa inválido", {
        description: "Use um endereço que comece com http:// ou https://.",
      });
    setBusy(true);
    const { error } = await supabase.from("articles").insert({
      title,
      slug,
      subtitle: String(form.get("subtitle") ?? ""),
      content: String(form.get("content") ?? ""),
      cover_url: cover || null,
      category_id: String(form.get("category_id") || "") || null,
      author_id: user.id,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else if (isStaff) {
      toast.success("Artigo publicado!");
      navigate({ to: "/artigo/$slug", params: { slug } });
    } else {
      toast.success("Artigo enviado para revisão", {
        description: "Ele será publicado depois que a moderação aprovar.",
      });
      if (ownProfile)
        navigate({ to: "/perfil/$username", params: { username: ownProfile.username } });
      else navigate({ to: "/" });
    }
  }
  return (
    <AppShell>
      <PageHeading title="Escrever artigo" subtitle="Compartilhe conhecimento com a comunidade." />
      {!user ? (
        <LoginPrompt />
      ) : (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input id="subtitle" name="subtitle" />
          </div>
          <div>
            <Label htmlFor="cover_url">Imagem de capa (link)</Label>
            <Input id="cover_url" name="cover_url" type="url" />
          </div>
          <div>
            <Label htmlFor="category_id">Categoria</Label>
            <select
              id="category_id"
              name="category_id"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Selecione uma categoria</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea id="content" name="content" className="min-h-64" required />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Enviando..." : isStaff ? "Publicar artigo" : "Enviar para revisão"}
          </Button>
        </form>
      )}
    </AppShell>
  );
}
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
export function LegalPage({ kind }: { kind: "termos" | "privacidade" }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeading title={kind === "termos" ? "Termos de uso" : "Política de privacidade"} />
        <p className="text-sm leading-7 text-muted-foreground">
          O InfoCampus é um espaço de troca entre estudantes da comunidade acadêmica do IFMA.
          Respeite as outras pessoas, publique apenas conteúdo que você tem direito de compartilhar
          e não divulgue dados pessoais de terceiros.
        </p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          As informaÃ§ões do seu perfil e as publicaÃ§ões são visíveis para outras pessoas.
          Mensagens privadas são acessíveis apenas às pessoas envolvidas. Para solicitar alteração
          ou exclusão de informaÃ§ões, entre em contato com a administração da comunidade.
        </p>
      </div>
    </AppShell>
  );
}
export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: SubmitEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Confira sua caixa de entrada para recuperar sua senha.");
  }
  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <PageHeading
          title="Recuperar senha"
          subtitle="Enviaremos um link para o seu e-mail institucional."
        />
        <form onSubmit={submit} className="space-y-4">
          <Label htmlFor="reset-email">E-mail institucional</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}

export function OpportunityPage({ id }: { id: string }) {
  const { opportunities } = useCampusData();
  const item = opportunities.data?.find((o) => o.id === id);
  const others = opportunities.data?.filter((o) => o.id !== id).slice(0, 4) ?? [];
  const editalUrl = item ? safeUrl(item.edital_url) : null;
  const attachments = item
    ? (item.attachments ??
      (item.attachment_urls ?? []).map((url, index) => ({ name: `Anexo ${index + 1}`, url })))
    : [];
  const registrationUrl = item ? safeUrl(item.registration_url) : null;
  const detailsUrl = item ? safeUrl(item.link) : null;

  return (
    <AppShell>
      {!item ? (
        <Empty text="Oportunidade não encontrada." />
      ) : (
        <article className="mx-auto max-w-5xl">
          <BackButton fallbackTo="/oportunidades" />
          <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div className="min-w-0">
              <Link
                to="/oportunidades"
                className="text-xs font-extrabold uppercase tracking-wide text-secondary hover:underline"
              >
                {item.type}
              </Link>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight text-foreground md:text-3xl">
                {item.title}
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            {item.deadline && (
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">InscriÃ§ões:</span>
                <span>{item.period ? item.period : `Até ${dateLong(item.deadline)}`}</span>
              </p>
            )}
            <p className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Categoria:</span>
              <span className="uppercase text-secondary font-bold">{item.type}</span>
            </p>
          </div>

          <section className="mt-8">
            <SectionHeading title="Sobre a oportunidade" />
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
              {item.description}
            </p>
          </section>

          {(item.edital_title || editalUrl || attachments.length > 0) && (
            <section className="mt-8 border-t border-border pt-6">
              <SectionHeading title="Documentos e Anexos" />
              <div className="space-y-3">
                {(item.edital_title || editalUrl) && (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-deep">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          {item.edital_title || "Arquivo do Edital de Abertura"}
                        </p>
                        <p className="text-xs text-muted-foreground">Arquivo principal do edital</p>
                      </div>
                    </div>
                    {editalUrl && (
                      <Button asChild size="sm" variant="outline" className="gap-1.5 shrink-0">
                        <a href={editalUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" /> Acessar
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {attachments.map((anexo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-xs font-medium">{anexo.name}</span>
                    </div>
                    {anexo.url && (
                      <a
                        href={safeUrl(anexo.url) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-primary-deep hover:underline"
                      >
                        Baixar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(registrationUrl || detailsUrl) && (
            <div className="mt-8 flex gap-3">
              <Button
                asChild
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-deep"
              >
                <a
                  href={registrationUrl ?? detailsUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {registrationUrl ? "Acessar inscrições" : "Saiba mais"}{" "}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}

          {others.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <SectionHeading title="Outras oportunidades" to="/oportunidades" />
              <div className="grid gap-4 md:grid-cols-2">
                {others.map((o) => (
                  <OpportunityTile item={o} key={o.id} />
                ))}
              </div>
            </section>
          )}
        </article>
      )}
    </AppShell>
  );
}
