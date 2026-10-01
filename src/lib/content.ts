import { supabase } from "@/integrations/supabase/client";

export type Author = { id: string; username: string; full_name: string; avatar_url: string | null };
export type Category = { id: string; slug: string; name: string; description: string | null };
export type Article = { id: string; slug: string; title: string; subtitle: string | null; content: string; cover_url: string | null; created_at: string; featured: boolean; tags: string[]; author_id: string | null; profiles: Author | null; categories: Category | null };
export type Post = { id: string; author_id: string; community_id: string | null; content: string; image_url: string | null; video_url: string | null; link_url: string | null; created_at: string; profiles: Author | null; communities: { name: string; slug: string } | null; post_likes: { user_id: string }[]; comments: { id: string }[] };
export type CampusEvent = { id: string; title: string; summary: string | null; location: string | null; starts_at: string };
export type Community = { id: string; slug: string; name: string; description: string | null; cover_url: string | null; community_members: { user_id: string }[] };
export type Opportunity = { id: string; title: string; type: string; description: string; deadline: string | null; link: string | null };

async function checked<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}
export const content = {
  articles: () => checked<Article[]>(supabase.from("articles").select("id,slug,title,subtitle,content,cover_url,created_at,featured,tags,author_id,profiles!articles_author_id_fkey(id,username,full_name,avatar_url),categories(id,slug,name,description)").eq("published", true).order("created_at", { ascending: false })),
  posts: () => checked<Post[]>(supabase.from("posts").select("id,author_id,community_id,content,image_url,video_url,link_url,created_at,profiles!posts_author_id_fkey(id,username,full_name,avatar_url),communities(name,slug),post_likes(user_id),comments(id)").order("created_at", { ascending: false }).limit(40)),
  events: () => checked<CampusEvent[]>(supabase.from("events").select("id,title,summary,location,starts_at").order("starts_at", { ascending: true })),
  communities: () => checked<Community[]>(supabase.from("communities").select("id,slug,name,description,cover_url,community_members(user_id)").order("name")),
  categories: () => checked<Category[]>(supabase.from("categories").select("id,slug,name,description").order("name")),
  opportunities: () => checked<Opportunity[]>(supabase.from("opportunities").select("id,title,type,description,deadline,link").order("created_at", { ascending: false })),
};
