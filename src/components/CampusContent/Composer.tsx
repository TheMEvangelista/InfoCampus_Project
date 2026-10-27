import { useRef, useState, type ChangeEvent, type DragEvent, type SubmitEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Link2, Send, Trash2, UploadCloud, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/lib/auth";
import { content } from "@/lib/content";
import { isSafeHttpUrl, safeUrl } from "@/lib/url";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/UI/popover";

export function Composer({
  communityId,
  disabled = false,
}: {
  communityId?: string;
  disabled?: boolean;
}) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: content.communities,
    enabled: !!user && !communityId,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{
    path: string;
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [links, setLinks] = useState<string[]>([]);
  const [linksOpen, setLinksOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);

  function discardUploadedImage() {
    if (uploadedImage?.path) void supabase.storage.from("post-media").remove([uploadedImage.path]);
    setUploadedImage(null);
  }

  async function uploadImage(file?: File) {
    if (!file || !user) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type))
      return toast.error("Escolha uma imagem JPEG, PNG, WebP ou GIF.");
    if (file.size > 2.5 * 1024 * 1024) return toast.error("Imagens podem ter até 2,5 MB.");
    discardUploadedImage();
    setImageUrl("");
    setUploadBusy(true);
    const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("post-media").upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
    setUploadBusy(false);
    if (error)
      return toast.error("Não foi possível enviar a imagem", { description: error.message });
    const url = supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl;
    setUploadedImage({ path, url, name: file.name, size: file.size });
  }

  function onFileDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void uploadImage(event.dataTransfer.files[0]);
  }

  function addLink() {
    if (links.length >= 10) return toast.error("Adicione no máximo 10 links por publicação.");
    setLinks((current) => [...current, ""]);
    setLinksOpen(true);
  }

  function updateLink(index: number, value: string) {
    setLinks((current) =>
      current.map((link, currentIndex) => (currentIndex === index ? value : link)),
    );
  }

  function validateAndPublish(e: SubmitEvent) {
    e.preventDefault();
    if (!user) return toast.error("Entre na sua conta para publicar.");
    if (disabled) return toast.error("Participe da comunidade para publicar.");
    if (!text.trim()) return toast.error("Escreva sua publicação.");
    if (uploadBusy) return toast.error("Aguarde o fim do envio da imagem.");
    if (!uploadedImage && imageUrl.trim() && !isSafeHttpUrl(imageUrl))
      return toast.error("Link de imagem inválido", {
        description: "Use um endereço que comece com http:// ou https://.",
      });
    const validLinks = links.map((link) => link.trim()).filter(Boolean);
    if (validLinks.some((link) => !isSafeHttpUrl(link)))
      return toast.error("Confira os links", {
        description: "Cada link deve começar com http:// ou https://.",
      });
    if (communityId) void publish(communityId, validLinks);
    else setDestinationOpen(true);
  }

  async function publish(
    destinationId: string | null,
    validLinks = links.map((link) => link.trim()).filter(Boolean),
  ) {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      community_id: destinationId,
      content: text.trim(),
      ...(uploadedImage?.url || imageUrl.trim()
        ? { image_url: uploadedImage?.url ?? imageUrl.trim() }
        : {}),
      ...(validLinks.length ? { link_urls: validLinks } : {}),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setText("");
    setImageUrl("");
    setLinks([]);
    setLinksOpen(false);
    setUploadedImage(null);
    setDestinationOpen(false);
    toast.success("Publicação criada!");
    await queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  const joinedCommunities =
    communities?.filter((community) =>
      community.community_members.some((member) => member.user_id === user?.id),
    ) ?? [];

  return (
    <div className="relative">
      <form
        onSubmit={validateAndPublish}
        className="rounded-md border border-border bg-card p-4 shadow-card"
      >
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={safeUrl(profile?.avatar_url) ?? undefined} />
            <AvatarFallback>{profile?.full_name?.charAt(0) ?? "I"}</AvatarFallback>
          </Avatar>
          <Textarea
            aria-label="Escrever publicação"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || busy}
            placeholder={
              user
                ? "O que está acontecendo no campus?"
                : "Entre para compartilhar com a comunidade..."
            }
            className="min-h-16 resize-none border-0 bg-muted/70 shadow-none focus-visible:ring-0"
          />
        </div>

        {imageOpen && !uploadedImage && (
          <Input
            aria-label="Link da imagem"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Cole o link da imagem"
            className="mt-3"
          />
        )}
        {uploadedImage && (
          <div className="mt-3 flex items-center gap-3 rounded-md border border-border px-3 py-2">
            <ImagePlus className="h-4 w-4 text-primary-deep" />
            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
              {uploadedImage.name} · {(uploadedImage.size / 1024 / 1024).toFixed(1)} MB
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remover imagem"
              onClick={discardUploadedImage}
            >
              <Trash2 />
            </Button>
          </div>
        )}
        {linksOpen &&
          links.map((link, index) => (
            <div className="mt-3 flex gap-2" key={index}>
              <Input
                aria-label={`Link ${index + 1}`}
                type="url"
                value={link}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateLink(index, e.target.value)}
                placeholder="https://..."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remover link ${index + 1}`}
                onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}
              >
                <X />
              </Button>
            </div>
          ))}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex gap-1">
            <Button
              type="button"
              variant={imageOpen ? "secondary" : "ghost"}
              size="sm"
              disabled={uploadBusy || disabled}
              onClick={() => {
                setImageOpen((open) => !open);
                if (!imageOpen) fileInputRef.current?.click();
              }}
            >
              <ImagePlus />
              <span>Imagem</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                void uploadImage(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant={linksOpen ? "secondary" : "ghost"}
              size="sm"
              disabled={disabled}
              onClick={() => {
                setLinksOpen((open) => !open);
                if (!linksOpen && links.length === 0) addLink();
              }}
            >
              <Link2 />
              <span>Links</span>
            </Button>
            {linksOpen && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || links.length >= 10}
                onClick={addLink}
              >
                <Link2 />
                <span>Adicionar link</span>
              </Button>
            )}
          </div>
          {communityId ? (
            <Button type="submit" size="sm" disabled={disabled || busy || uploadBusy || !user}>
              {busy ? "Publicando..." : "Publicar"}
              <Send />
            </Button>
          ) : (
            <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
              <PopoverTrigger asChild>
                <Button type="submit" size="sm" disabled={busy || uploadBusy || !user}>
                  {busy ? "Publicando..." : "Publicar"}
                  <Send />
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
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {community.name}
                        </span>
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
          )}
        </div>
        {imageOpen && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onFileDrop}
            className={`mt-3 flex min-h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground ${isDragging ? "border-primary bg-primary-soft/70" : "border-border"}`}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Arraste uma imagem até aqui
          </div>
        )}
      </form>
    </div>
  );
}
