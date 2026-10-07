import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Bookmark, CalendarDays, Heart, ImagePlus, Link2, MapPin, MessageCircle, MoreHorizontal, Send, Share2, Video, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/lib/auth";
import { content, type Article, type Post, type CampusEvent, type Community, type Opportunity } from "@/lib/content";
import { dayMonth, dateLong, timeAgo } from "@/lib/format";
import { isSafeHttpUrl, safeUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import campusStudents from "@/assets/campus-students.jpg";
import campusRobotics from "@/assets/campus-robotics.jpg";

export const articleImage = (article: Article) => safeUrl(article.cover_url) || (article.slug === "semana-tecnologia" ? campusRobotics : campusStudents);
export function useCampusData() {
  const articles = useQuery({ queryKey: ["articles"], queryFn: content.articles });
  const posts = useQuery({ queryKey: ["posts"], queryFn: content.posts });
  const events = useQuery({ queryKey: ["events"], queryFn: content.events });
  const communities = useQuery({ queryKey: ["communities"], queryFn: content.communities });
  const categories = useQuery({ queryKey: ["categories"], queryFn: content.categories });
  const opportunities = useQuery({ queryKey: ["opportunities"], queryFn: content.opportunities });
  return { articles, posts, events, communities, categories, opportunities };
}
export function SectionHeading({ title, to, action = "Ver todos" }: { title: string; to?: "/noticias" | "/eventos" | "/oportunidades" | "/comunidades" | "/artigos"; action?: string }) {
  return <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-extrabold text-foreground">{title}</h2>{to && <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary-deep hover:underline">{action}<ArrowRight className="h-3.5 w-3.5" /></Link>}</div>;
}
export function PageHeading({ title, subtitle }: { title: string; subtitle?: string | undefined }) {
  return <div className="mb-7 border-b border-border pb-5"><h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{title}</h1>{subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}</div>;
}
export function Empty({ text = "Nada por aqui ainda." }: { text?: string }) { return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>; }
export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return <Link to="/artigo/$slug" params={{ slug: article.slug }} className="group block overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-card"><img src={articleImage(article)} alt="" loading="lazy" width={1280} height={720} className={`w-full object-cover ${compact ? "h-32" : "h-40"}`} /><div className="p-4"><span className="text-[10px] font-extrabold uppercase text-primary-deep">{article.categories?.name ?? "Notícia"}</span><h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary-deep">{article.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{article.subtitle}</p><p className="mt-3 text-[11px] text-muted-foreground">{article.profiles?.full_name ?? "InfoCampus"} · {timeAgo(article.created_at)}</p></div></Link>;
}
export function EventRow({ event }: { event: CampusEvent }) {
  const date = dayMonth(event.starts_at);
  return <div className="flex gap-3 border-b border-border py-3 last:border-0"><div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-primary-soft text-primary-deep"><b className="text-lg leading-5">{date.day}</b><span className="text-[10px] font-bold">{date.month}</span></div><div className="min-w-0"><h3 className="text-sm font-bold">{event.title}</h3><p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{event.summary}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{event.location ?? "IFMA"}</p></div></div>;
}
export function CommunityTile({ community }: { community: Community }) {
  const [joined, setJoined] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const member = community.community_members.some(m => m.user_id === user?.id);
  async function toggle() {
    if (!user) return toast.error("Entre na sua conta para participar.");
    const result = member ? await supabase.from("community_members").delete().eq("community_id", community.id).eq("user_id", user.id) : await supabase.from("community_members").insert({ community_id: community.id, user_id: user.id });
    if (result.error) return toast.error(result.error.message);
    setJoined(!joined); queryClient.invalidateQueries({ queryKey: ["communities"] });
  }
  return <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-deep"><Users className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{community.name}</h3><p className="line-clamp-1 text-xs text-muted-foreground">{community.description}</p><span className="text-[11px] text-muted-foreground">{community.community_members.length} membros</span></div><Button size="sm" variant={member ? "outline" : "default"} onClick={toggle} className="shrink-0">{member ? "Sair" : "Participar"}</Button></div>;
}
export function OpportunityTile({ item }: { item: Opportunity }) {
  return <div className="rounded-md border border-border bg-card p-5"><span className="text-[10px] font-extrabold uppercase text-secondary">{item.type}</span><h3 className="mt-1 text-base font-bold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>{item.deadline && <p className="mt-3 text-xs text-muted-foreground">Inscrições até {dateLong(item.deadline)}</p>}{safeUrl(item.link) && <a className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary-deep hover:underline" href={safeUrl(item.link)!} target="_blank" rel="noopener noreferrer">Saiba mais <ArrowRight className="h-4 w-4" /></a>}</div>;
}
export function Composer() {
  const { user } = useAuth(); const { data: profile } = useProfile(); const queryClient = useQueryClient();
  const [text, setText] = useState(""); const [mediaType, setMediaType] = useState<"image_url" | "video_url" | "link_url" | null>(null); const [url, setUrl] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!user) return toast.error("Entre na sua conta para publicar.");
    if (!text.trim()) return toast.error("Escreva sua publicação.");
    if (mediaType && url.trim() && !isSafeHttpUrl(url)) return toast.error("Link inválido", { description: "Use um endereço que comece com http:// ou https://." });
    setBusy(true); const { error } = await supabase.from("posts").insert({ author_id: user.id, content: text.trim(), ...(mediaType && url.trim() ? { [mediaType]: url.trim() } : {}) }); setBusy(false);
    if (error) return toast.error(error.message); setText(""); setUrl(""); setMediaType(null); toast.success("Publicação criada!"); queryClient.invalidateQueries({ queryKey: ["posts"] });
  }
  return <form onSubmit={submit} className="rounded-md border border-border bg-card p-4 shadow-card"><div className="flex gap-3"><Avatar className="h-10 w-10 shrink-0"><AvatarImage src={safeUrl(profile?.avatar_url) ?? undefined} /><AvatarFallback>{profile?.full_name?.charAt(0) ?? "I"}</AvatarFallback></Avatar><Textarea aria-label="Escrever publicação" value={text} onChange={e => setText(e.target.value)} placeholder={user ? "O que está acontecendo no campus?" : "Entre para compartilhar com a comunidade..."} className="min-h-16 resize-none border-0 bg-muted/70 shadow-none focus-visible:ring-0" /></div>{mediaType && <div className="mt-3"><Input aria-label="Endereço da mídia" value={url} onChange={e => setUrl(e.target.value)} placeholder="Cole o link aqui (https://...)" type="url" /></div>}<div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3"><div className="flex gap-1"><Button type="button" variant={mediaType === "image_url" ? "secondary" : "ghost"} size="sm" onClick={() => setMediaType(mediaType === "image_url" ? null : "image_url")}><ImagePlus /> <span className="hidden sm:inline">Imagem</span></Button><Button type="button" variant={mediaType === "video_url" ? "secondary" : "ghost"} size="sm" onClick={() => setMediaType(mediaType === "video_url" ? null : "video_url")}><Video /> <span className="hidden sm:inline">Vídeo</span></Button><Button type="button" variant={mediaType === "link_url" ? "secondary" : "ghost"} size="sm" onClick={() => setMediaType(mediaType === "link_url" ? null : "link_url")}><Link2 /> <span className="hidden sm:inline">Link</span></Button></div><Button type="submit" size="sm" disabled={busy || !user}>{busy ? "Publicando..." : "Publicar"} <Send /></Button></div></form>;
}
export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth(); const queryClient = useQueryClient(); const [comment, setComment] = useState(""); const [showComments, setShowComments] = useState(false); const [busy, setBusy] = useState(false);
  const liked = post.post_likes.some(l => l.user_id === user?.id);
  const saved = useQuery({ queryKey: ["saved-post", user?.id, post.id], enabled: !!user, queryFn: async () => { const { data } = await supabase.from("saved_items").select("item_id").eq("user_id", user?.id ?? "").eq("item_type", "post").eq("item_id", post.id).maybeSingle(); return !!data; } });
  async function like() { if (!user) return toast.error("Entre na sua conta para curtir."); const result = liked ? await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id) : await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id }); if (result.error) toast.error(result.error.message); else queryClient.invalidateQueries({ queryKey: ["posts"] }); }
  async function save() { if (!user) return toast.error("Entre na sua conta para salvar."); const result = saved.data ? await supabase.from("saved_items").delete().eq("user_id", user.id).eq("item_type", "post").eq("item_id", post.id) : await supabase.from("saved_items").insert({ user_id: user.id, item_type: "post", item_id: post.id }); if (result.error) toast.error(result.error.message); else queryClient.invalidateQueries({ queryKey: ["saved-post", user.id, post.id] }); }
  async function submitComment(e: FormEvent) { e.preventDefault(); if (!user) return toast.error("Entre para comentar."); if (!comment.trim()) return; setBusy(true); const { error } = await supabase.from("comments").insert({ post_id: post.id, author_id: user.id, content: comment.trim() }); setBusy(false); if (error) toast.error(error.message); else { setComment(""); toast.success("Comentário enviado!"); queryClient.invalidateQueries({ queryKey: ["posts"] }); } }
  return <article className="rounded-md border border-border bg-card p-5 shadow-card"><div className="flex items-start gap-3"><Avatar className="h-10 w-10"><AvatarImage src={safeUrl(post.profiles?.avatar_url) ?? undefined} /><AvatarFallback>{post.profiles?.full_name?.charAt(0) ?? "I"}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><Link to="/perfil/$username" params={{ username: post.profiles?.username ?? "" }} className="text-sm font-bold hover:text-primary-deep">{post.profiles?.full_name ?? "Estudante"}</Link><p className="text-xs text-muted-foreground">@{post.profiles?.username} · {timeAgo(post.created_at)}{post.communities && <> · {post.communities.name}</>}</p></div><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></div><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>{safeUrl(post.image_url) && <img src={safeUrl(post.image_url)!} alt="Imagem da publicação" className="mt-4 max-h-96 w-full rounded-md object-cover" />}{safeUrl(post.video_url) && <a href={safeUrl(post.video_url)!} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-primary-deep underline">Ver vídeo</a>}{safeUrl(post.link_url) && <a href={safeUrl(post.link_url)!} target="_blank" rel="noopener noreferrer" className="mt-3 block truncate text-sm text-primary-deep underline">{post.link_url}</a>}<div className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-muted-foreground"><Button variant="ghost" size="sm" onClick={like} className={liked ? "text-secondary" : ""} aria-label="Curtir publicação"><Heart className={liked ? "fill-current" : ""} />{post.post_likes.length}</Button><Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} aria-label="Comentários"><MessageCircle />{post.comments.length}</Button><Button variant="ghost" size="icon" onClick={async () => { await navigator.clipboard.writeText(window.location.href); toast.success("Link copiado!"); }} aria-label="Compartilhar"><Share2 /></Button><Button variant="ghost" size="icon" className={`ml-auto ${saved.data ? "text-primary-deep" : ""}`} onClick={save} aria-label="Salvar publicação"><Bookmark className={saved.data ? "fill-current" : ""} /></Button></div>{showComments && <div className="mt-3 border-t border-border pt-3"><form onSubmit={submitComment} className="flex gap-2"><Input aria-label="Seu comentário" value={comment} onChange={e => setComment(e.target.value)} placeholder="Escreva um comentário..." /><Button size="icon" type="submit" disabled={busy} aria-label="Enviar comentário"><Send /></Button></form><PostComments postId={post.id} /></div>}</article>;
}
function PostComments({ postId }: { postId: string }) { const { data } = useQuery({ queryKey: ["post-comments", postId], queryFn: async () => { const { data, error } = await supabase.from("comments").select("id,content,created_at,profiles(full_name,username)").eq("post_id", postId).order("created_at", { ascending: true }); if (error) throw error; return data; } }); return <div className="space-y-2 pt-3">{data?.map(c => <p key={c.id} className="rounded-md bg-muted p-3 text-xs"><b>{c.profiles?.full_name ?? "Estudante"}</b> {c.content}</p>)}</div>; }
