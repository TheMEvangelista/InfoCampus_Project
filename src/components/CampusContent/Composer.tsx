import { useRef, useState, DragEvent, FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileUp,
  ImagePlus,
  Link2,
  LoaderCircle,
  Send,
  Trash2,
  UploadCloud,
  Users,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/lib/auth";
import { content } from "@/lib/content";
import { isSafeHttpUrl, safeUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
