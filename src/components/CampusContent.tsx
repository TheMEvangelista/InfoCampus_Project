import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  FileUp,
  Heart,
  ImagePlus,
  Link2,
  LoaderCircle,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Trash2,
  UploadCloud,
  Users,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/lib/auth";
import {
  content,
  type Article,
  type Post,
  type CampusEvent,
  type Community,
  type Opportunity,
} from "@/lib/content";
import { dayMonth, dateLong, timeAgo } from "@/lib/format";
import { isSafeHttpUrl, safeUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import campusStudents from "@/assets/Images/Image-1.jpg";
import campusRobotics from "@/assets/Images/Image-2.jpg";
import newsImage3 from "@/assets/Images/Image-3.jpg";
import newsImage4 from "@/assets/Images/Image-4.jpg";
import newsImage5 from "@/assets/Images/Image-5.jpg";
import newsImage6 from "@/assets/Images/Image-6.jpg";

const localNewsImages: Record<string, string> = {
  "ciclo-formacao-continuada-dai-anapne": campusStudents,
  "concurso-cultural-raizes-em-movimento": newsImage3,
  "semana-informatica-2026-porto-franco": campusRobotics,
  "oficina-projetos-pibic-pibit-ifma": newsImage4,
  "vii-workshop-informatica-ifma": newsImage5,
  "vii-edifica-projetos-de-impacto": newsImage6,
};
export const articleImage = (article: Article) =>
  safeUrl(article.cover_url) || localNewsImages[article.slug] || campusStudents;

export function SectionHeading({
  title,
  to,
  action = "Ver todos",
}: {
  title: string;
  to?: "/noticias" | "/eventos" | "/oportunidades" | "/comunidades" | "/artigos";
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
      {to && (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary-deep hover:underline"
        >
          {action}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
export function PageHeading({ title, subtitle }: { title: string; subtitle?: string | undefined }) {
  return (
    <div className="mb-7 border-b border-border pb-5">
      <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
type BackDestination =
  "/" | "/noticias" | "/eventos" | "/oportunidades" | "/comunidades" | "/mensagens";
export function BackButton({
  fallbackTo = "/",
  label = "Voltar",
}: {
  fallbackTo?: BackDestination;
  label?: string;
}) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        if (router.history.canGoBack()) router.history.back();
        else void router.navigate({ to: fallbackTo });
      }}
      className="mb-4 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Button>
  );
}
export function Empty({ text = "Nada por aqui ainda." }: { text?: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>;
}
export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <Link
      to="/artigo/$slug"
      params={{ slug: article.slug }}
      className="group block overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-card"
    >
      <img
        src={articleImage(article)}
        alt=""
        loading="lazy"
        width={1280}
        height={720}
        className={`w-full object-cover ${compact ? "h-32" : "h-40"}`}
      />
      <div className="p-4">
        <span className="text-[10px] font-extrabold uppercase text-primary-deep">
          {article.categories?.name ?? "Notícia"}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary-deep">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.subtitle}
        </p>
        <p className="mt-3 text-[11px] text-muted-foreground">
          {article.profiles?.full_name ?? "InfoCampus"} · {timeAgo(article.created_at)}
        </p>
      </div>
    </Link>
  );
}
export function NewsArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to="/artigo/$slug"
      params={{ slug: article.slug }}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <img
        src={articleImage(article)}
        alt=""
        loading="lazy"
        width={1280}
        height={720}
        className="h-44 w-full object-cover"
      />
      <div className="flex min-h-36 flex-col p-4">
        <h3 className="line-clamp-3 text-sm font-bold leading-snug text-foreground group-hover:text-primary-deep">
          {article.title}
        </h3>
        {article.subtitle && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {article.subtitle}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-primary-deep">
          Ler mais{" "}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
export function EventRow({ event }: { event: CampusEvent }) {
  const date = dayMonth(event.starts_at);
  return (
    <div className="flex gap-3 border-b border-border py-3 last:border-0">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-primary-soft text-primary-deep">
        <b className="text-lg leading-5">{date.day}</b>
        <span className="text-[10px] font-bold">{date.month}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold">{event.title}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{event.summary}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {event.location ?? "IFMA"}
        </p>
      </div>
    </div>
  );
}
export function CommunityTile({ community }: { community: Community }) {
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const member = community.community_members.some((m) => m.user_id === user?.id);
  async function toggle() {
    if (!user) return toast.error("Entre na sua conta para participar.");
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
  }
  const memberCount = community.community_members.length;
  return (
    <article className="flex min-h-28 items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-card">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
        <Users className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-foreground">{community.name}</h2>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
        <span className="mt-1.5 block text-xs text-muted-foreground">
          {memberCount} {memberCount === 1 ? "membro" : "membros"}
        </span>
      </div>
      <Button
        size="sm"
        variant={member ? "outline" : "default"}
        onClick={toggle}
        disabled={busy}
        className="shrink-0"
      >
        {busy ? "Aguarde..." : member ? "Sair" : "Participar"}
      </Button>
    </article>
  );
}
const opportunityLabels: Record<string, string> = {
  estagio: "Estágio",
  emprego: "Emprego",
  bolsa: "Bolsa",
  pesquisa: "Pesquisa",
  monitoria: "Monitoria",
};

export function OpportunityTile({ item }: { item: Opportunity }) {
  const label = (opportunityLabels[item.type] ?? item.type).toUpperCase();

  return (
    <Link
      to="/oportunidade/$id"
      params={{ id: item.id }}
      className="group block rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-card"
    >
      <article className="flex min-h-full flex-col justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-secondary">
            {label}
          </span>
          <h2 className="mt-1.5 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary-deep">
            {item.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-2">
          {item.deadline && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Inscrições até {dateLong(item.deadline)}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-deep group-hover:underline">
              Ver detalhes{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
            {item.period && (
              <span className="text-[10px] font-medium text-muted-foreground/80">
                Vigência 2026/2027
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
export function Composer() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: content.communities,
    enabled: !!user,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [mediaType, setMediaType] = useState<"image_url" | "video_url" | null>(null);
  const [url, setUrl] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<{
    path: string;
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);

  function discardUploadedMedia() {
    if (uploadedMedia?.path) {
      void supabase.storage
        .from("post-media")
        .remove([uploadedMedia.path])
        .then(({ error }) => {
          if (error)
            toast.error("Não foi possível remover o arquivo enviado.", {
              description: error.message,
            });
        });
    }
    setUploadedMedia(null);
  }

  async function uploadFile(file?: File) {
    if (!file || !user) return;
    const isImage = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
    const isVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type);
    if ((mediaType === "image_url" && !isImage) || (mediaType === "video_url" && !isVideo))
      return toast.error(
        mediaType === "image_url"
          ? "Escolha um arquivo de imagem."
          : "Escolha um arquivo de vídeo.",
      );
    if (!isImage && !isVideo)
      return toast.error("Formato não compatível", {
        description: "Envie uma imagem JPEG, PNG, WebP ou GIF, ou um vídeo MP4, WebM ou MOV.",
      });
    const maxFileSize = isImage ? 2.5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxFileSize)
      return toast.error("Arquivo muito grande", {
        description: isImage ? "Imagens podem ter até 2,5 MB." : "Vídeos podem ter até 10 MB.",
      });

    discardUploadedMedia();
    setUrl("");
    setUploadBusy(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from("post-media")
      .upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    setUploadBusy(false);
    if (error)
      return toast.error("Não foi possível enviar o arquivo", { description: error.message });

    const publicUrl = supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl;
    setUploadedMedia({ path, url: publicUrl, name: file.name, size: file.size });
  }

  function selectMediaType(type: "image_url" | "video_url") {
    if (uploadBusy) return;
    if (uploadedMedia) discardUploadedMedia();
    setMediaType(mediaType === type ? null : type);
    setUrl("");
  }

  function onFileDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void uploadFile(event.dataTransfer.files[0]);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return toast.error("Entre na sua conta para publicar.");
    if (!text.trim()) return toast.error("Escreva sua publicação.");
    if (uploadBusy) return toast.error("Aguarde o fim do envio do arquivo.");
    if (mediaType && !uploadedMedia && !url.trim())
      return toast.error("Envie um arquivo ou informe um link de mídia.");
    if (mediaType && !uploadedMedia && url.trim() && !isSafeHttpUrl(url))
      return toast.error("Link inválido", {
        description: "Use um endereço que comece com http:// ou https://.",
      });
    setDestination(null);
    setDestinationOpen(true);
  }
  async function publish(destinationId = destination) {
    if (!user) return;
    setBusy(true);
    const mediaUrl = uploadedMedia?.url ?? url.trim();
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      community_id: destinationId,
      content: text.trim(),
      ...(mediaType && mediaUrl ? { [mediaType]: mediaUrl } : {}),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setText("");
    setUrl("");
    setMediaType(null);
    setUploadedMedia(null);
    setDestinationOpen(false);
    toast.success("Publicação criada!");
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  }
  const joinedCommunities =
    communities?.filter((community) =>
      community.community_members.some((member) => member.user_id === user?.id),
    ) ?? [];
  return (
    <div className="relative">
      <form onSubmit={submit} className="rounded-md border border-border bg-card p-4 shadow-card">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={safeUrl(profile?.avatar_url) ?? undefined} />
            <AvatarFallback>{profile?.full_name?.charAt(0) ?? "I"}</AvatarFallback>
          </Avatar>
          <Textarea
            aria-label="Escrever publicação"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              user
                ? "O que está acontecendo no campus?"
                : "Entre para compartilhar com a comunidade..."
            }
            className="min-h-16 resize-none border-0 bg-muted/70 shadow-none focus-visible:ring-0"
          />
        </div>

        {mediaType && (
          <div className="mt-4 space-y-3">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onFileDrop}
              className={`flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors ${isDragging ? "border-primary bg-primary-soft/70" : "border-border hover:border-primary/50"}`}
            >
              {uploadBusy ? (
                <LoaderCircle className="h-7 w-7 animate-spin text-primary-deep" />
              ) : (
                <UploadCloud className="h-7 w-7 text-muted-foreground" />
              )}
              <p className="mt-3 text-sm font-semibold">
                {uploadBusy ? "Enviando arquivo..." : "Escolha um arquivo ou arraste até aqui."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mediaType === "image_url"
                  ? "JPEG, PNG, WebP ou GIF. Até 2,5 MB."
                  : "MP4, WebM ou MOV. Até 10 MB."}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={
                  mediaType === "image_url"
                    ? "image/jpeg,image/png,image/webp,image/gif"
                    : "video/mp4,video/webm,video/quicktime"
                }
                className="hidden"
                onChange={(event) => {
                  void uploadFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                disabled={uploadBusy || !user}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp /> Procurar arquivo
              </Button>
            </div>
            {uploadedMedia && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-deep">
                  {mediaType === "video_url" ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{uploadedMedia.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    {(uploadedMedia.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                    <CheckCircle2 className="h-3 w-3 text-primary" /> Enviado
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover arquivo enviado"
                  onClick={() => {
                    discardUploadedMedia();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>ou</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <Link2 className="h-3.5 w-3.5" />
                Importar por link
              </p>
              <Input
                aria-label="Link da mídia"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole o link da imagem ou vídeo"
                type="url"
                disabled={!!uploadedMedia || uploadBusy}
              />
              {uploadedMedia && (
                <p className="text-[11px] text-muted-foreground">
                  Remova o arquivo enviado para usar um link.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex gap-1">
            <Button
              type="button"
              variant={mediaType === "image_url" ? "secondary" : "ghost"}
              size="sm"
              disabled={uploadBusy}
              onClick={() => selectMediaType("image_url")}
            >
              <ImagePlus /> <span className="hidden sm:inline">Imagem</span>
            </Button>
            <Button
              type="button"
              variant={mediaType === "video_url" ? "secondary" : "ghost"}
              size="sm"
              disabled={uploadBusy}
              onClick={() => selectMediaType("video_url")}
            >
              <Video /> <span className="hidden sm:inline">Vídeo</span>
            </Button>
          </div>
          <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
            <PopoverTrigger asChild>
              <Button type="submit" size="sm" disabled={busy || uploadBusy || !user}>
                {busy ? "Publicando..." : "Publicar"} <Send />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" sideOffset={8} className="w-72 p-1.5">
              <div
                className="max-h-72 overflow-y-auto"
                role="menu"
                aria-label="Escolha onde publicar"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void publish(null)}
                  disabled={busy}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent disabled:opacity-60"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={safeUrl(profile?.avatar_url) ?? undefined} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) ?? "I"}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1 truncate font-medium">Meu perfil</span>
                </button>
                {communitiesLoading && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    Carregando comunidades...
                  </p>
                )}
                {!communitiesLoading &&
                  joinedCommunities.map((community) => (
                    <button
                      key={community.id}
                      type="button"
                      role="menuitem"
                      onClick={() => void publish(community.id)}
                      disabled={busy}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent disabled:opacity-60"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {safeUrl(community.cover_url) ? (
                          <img
                            src={safeUrl(community.cover_url)!}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">{community.name}</span>
                    </button>
                  ))}
                {!communitiesLoading && joinedCommunities.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    Você ainda não participa de comunidades.
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </form>
    </div>
  );
}
export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [busy, setBusy] = useState(false);
  const liked = post.post_likes.some((l) => l.user_id === user?.id);
  const saved = useQuery({
    queryKey: ["saved-post", user?.id, post.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_items")
        .select("item_id")
        .eq("user_id", user?.id ?? "")
        .eq("item_type", "post")
        .eq("item_id", post.id)
        .maybeSingle();
      return !!data;
    },
  });
  async function like() {
    if (!user) return toast.error("Entre na sua conta para curtir.");
    const result = liked
      ? await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id)
      : await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    if (result.error) toast.error(result.error.message);
    else queryClient.invalidateQueries({ queryKey: ["posts"] });
  }
  async function save() {
    if (!user) return toast.error("Entre na sua conta para salvar.");
    const result = saved.data
      ? await supabase
          .from("saved_items")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", "post")
          .eq("item_id", post.id)
      : await supabase
          .from("saved_items")
          .insert({ user_id: user.id, item_type: "post", item_id: post.id });
    if (result.error) toast.error(result.error.message);
    else queryClient.invalidateQueries({ queryKey: ["saved-post", user.id, post.id] });
  }
  async function submitComment(e: FormEvent) {
    e.preventDefault();
    if (!user) return toast.error("Entre para comentar.");
    if (!comment.trim()) return;
    setBusy(true);
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, author_id: user.id, content: comment.trim() });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      setComment("");
      toast.success("Comentário enviado!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  }
  return (
    <article className="rounded-md border border-border bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={safeUrl(post.profiles?.avatar_url) ?? undefined} />
          <AvatarFallback>{post.profiles?.full_name?.charAt(0) ?? "I"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Link
            to="/perfil/$username"
            params={{ username: post.profiles?.username ?? "" }}
            className="text-sm font-bold hover:text-primary-deep"
          >
            {post.profiles?.full_name ?? "Estudante"}
          </Link>
          <p className="text-xs text-muted-foreground">
            @{post.profiles?.username} · {timeAgo(post.created_at)}
            {post.communities && <> · {post.communities.name}</>}
          </p>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
      {safeUrl(post.image_url) && (
        <img
          src={safeUrl(post.image_url)!}
          alt="Imagem da publicação"
          className="mt-4 max-h-96 w-full rounded-md object-cover"
        />
      )}
      {safeUrl(post.video_url) && (
        <a
          href={safeUrl(post.video_url)!}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-sm text-primary-deep underline"
        >
          Ver vídeo
        </a>
      )}
      {safeUrl(post.link_url) && (
        <a
          href={safeUrl(post.link_url)!}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block truncate text-sm text-primary-deep underline"
        >
          {post.link_url}
        </a>
      )}
      <div className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={like}
          className={liked ? "text-secondary" : ""}
          aria-label="Curtir publicação"
        >
          <Heart className={liked ? "fill-current" : ""} />
          {post.post_likes.length}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          aria-label="Comentários"
        >
          <MessageCircle />
          {post.comments.length}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copiado!");
          }}
          aria-label="Compartilhar"
        >
          <Share2 />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`ml-auto ${saved.data ? "text-primary-deep" : ""}`}
          onClick={save}
          aria-label="Salvar publicação"
        >
          <Bookmark className={saved.data ? "fill-current" : ""} />
        </Button>
      </div>
      {showComments && (
        <div className="mt-3 border-t border-border pt-3">
          <form onSubmit={submitComment} className="flex gap-2">
            <Input
              aria-label="Seu comentário"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escreva um comentário..."
            />
            <Button size="icon" type="submit" disabled={busy} aria-label="Enviar comentário">
              <Send />
            </Button>
          </form>
          <PostComments postId={post.id} />
        </div>
      )}
    </article>
  );
}
function PostComments({ postId }: { postId: string }) {
  const { data } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id,content,created_at,profiles(full_name,username)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="space-y-2 pt-3">
      {data?.map((c) => (
        <p key={c.id} className="rounded-md bg-muted p-3 text-xs">
          <b>{c.profiles?.full_name ?? "Estudante"}</b> {c.content}
        </p>
      ))}
    </div>
  );
}
