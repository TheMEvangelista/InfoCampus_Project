import { useState, FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, MessageCircle, MoreHorizontal, Send, Copy, Pencil, Trash2, Flag, MessageSquareOff, ExternalLink, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Post } from "@/lib/content";
import { timeAgo } from "@/lib/format";
import { safeUrl } from "@/lib/url";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/UI/dropdown-menu";
import { Textarea } from "@/components/UI/textarea";

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const isAuthor = user?.id === post.author_id;
  const commentsDisabled = Boolean((post as Post & { comments_enabled?: boolean }).comments_enabled === false);
  const liked = post.post_likes.some((l) => l.user_id === user?.id);
  async function like() {
    if (!user) return toast.error("Entre na sua conta para curtir.");
    const result = liked
      ? await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id)
      : await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    if (result.error) toast.error(result.error.message);
    else queryClient.invalidateQueries({ queryKey: ["posts"] });
  }
  async function copyLink() {
    const postUrl = new URL(window.location.href);
    postUrl.searchParams.set("publicacao", post.id);
    postUrl.hash = `post-${post.id}`;
    try { await navigator.clipboard.writeText(postUrl.toString()); toast.success("Link copiado!"); }
    catch { toast.error("Não foi possível copiar o link."); }
  }
  async function deletePost() {
    const { error } = await supabase.from("posts").delete().eq("id", post.id).eq("author_id", user?.id ?? "");
    if (error) toast.error(error.message);
    else { toast.success("Publicação excluída."); await queryClient.invalidateQueries({ queryKey: ["posts"] }); }
  }
  async function updatePost() {
    if (!editedContent.trim()) return toast.error("A publicação não pode ficar vazia.");
    const { error } = await supabase.from("posts").update({ content: editedContent.trim() }).eq("id", post.id).eq("author_id", user?.id ?? "");
    if (error) toast.error(error.message);
    else { setEditing(false); toast.success("Publicação atualizada."); await queryClient.invalidateQueries({ queryKey: ["posts"] }); }
  }
  async function toggleComments() {
    const { error } = await supabase.from("posts").update({ comments_enabled: commentsDisabled }).eq("id", post.id).eq("author_id", user?.id ?? "");
    if (error) toast.error(error.message);
    else { toast.success(commentsDisabled ? "Comentários ativados." : "Comentários desativados."); await queryClient.invalidateQueries({ queryKey: ["posts"] }); }
  }
  async function reportPost() {
    if (!user) return toast.error("Entre na sua conta para denunciar.");
    const { error } = await supabase.from("reports").insert({ reporter_id: user.id, item_type: "post", item_id: post.id, reason: "Denúncia de publicação" });
    if (error) toast.error(error.message);
    else toast.success("Denúncia enviada para análise.");
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
    <article
      id={`post-${post.id}`}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={safeUrl(post.profiles?.avatar_url) ?? undefined} />
          <AvatarFallback>{post.profiles?.full_name?.charAt(0) ?? "I"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {post.profiles?.username ? (
            <Link
              to="/perfil/$username"
              params={{ username: post.profiles.username }}
              className="text-sm font-bold hover:text-primary-deep"
            >
              {post.profiles.full_name ?? "Estudante"}
            </Link>
          ) : (
            <span className="text-sm font-bold">{post.profiles?.full_name ?? "Estudante"}</span>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="text-primary-deep">@{post.profiles?.username ?? "estudante"}</span> · {timeAgo(post.created_at)}
            {post.communities && <> · <span className="font-medium text-primary-deep">{post.communities.name}</span></>}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Mais opções"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAuthor ? <>
              <DropdownMenuItem onSelect={() => { setEditedContent(post.content); setEditing(true); }}><Pencil /> Editar</DropdownMenuItem>
              <DropdownMenuItem onSelect={toggleComments}><MessageSquareOff /> {commentsDisabled ? "Ativar comentários" : "Desativar comentários"}</DropdownMenuItem>
              <DropdownMenuItem onSelect={deletePost} className="text-destructive"><Trash2 /> Excluir</DropdownMenuItem>
            </> : <DropdownMenuItem onSelect={reportPost}><Flag /> Denunciar</DropdownMenuItem>}
            <DropdownMenuItem onSelect={copyLink}><Copy /> Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {editing ? <div className="mt-4 space-y-2"><Textarea value={editedContent} onChange={(event) => setEditedContent(event.target.value)} rows={4} /><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancelar</Button><Button size="sm" onClick={updatePost}>Salvar</Button></div></div> : <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>}
      {safeUrl(post.image_url) && (
        <img
          src={safeUrl(post.image_url)!}
          alt="Imagem da publicação"
          className="mt-3 max-h-96 w-full rounded-xl object-cover"
        />
      )}
      {post.link_urls.map((link) => {
        const href = safeUrl(link);
        if (!href) return null;
        let hostname = href;
        let path = "";
        try {
          const parsed = new URL(href);
          hostname = parsed.hostname.replace(/^www\./, "");
          path = parsed.pathname === "/" ? "" : decodeURIComponent(parsed.pathname);
        } catch {
          // safeUrl already rejects malformed and non-HTTP URLs.
        }
        return (
          <a key={link} href={href} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-24 items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60 sm:p-4">
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-deep"><ExternalLink className="h-3.5 w-3.5" />{hostname}</span>
              <span className="mt-1 block truncate text-sm font-semibold text-foreground">{path ? path.replaceAll("-", " ").replaceAll("/", " · ") : hostname}</span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">{href}</span>
            </span>
            <span className="shrink-0 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground">Acessar link <ExternalLink className="ml-1 inline h-3 w-3" /></span>
          </a>
        );
      })}
      <div className="mt-4 flex items-center gap-1 border-t border-border pt-2 text-muted-foreground">
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
        <Button variant="ghost" size="sm" onClick={copyLink} aria-label="Compartilhar publicação">
          <Share2 />
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
</div>
      {showComments && !commentsDisabled && (
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

