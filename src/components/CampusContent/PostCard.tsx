import { useState, FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { content, Post } from "@/lib/content";
import { timeAgo } from "@/lib/format";
import { safeUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
