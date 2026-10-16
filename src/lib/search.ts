import { supabase } from "@/integrations/supabase/client";

export const SEARCH_PAGE_SIZE = 12;
export const SEARCH_MAX_LENGTH = 100;
export type SearchKind = "artigos" | "pessoas" | "comunidades";
export const SEARCH_KINDS: SearchKind[] = ["artigos", "pessoas", "comunidades"];

export function normalizeSearch(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_LENGTH) : "";
}

export function normalizePage(value: unknown) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 && page <= 10000 ? page : 1;
}

export function normalizeKind(value: unknown): SearchKind {
  return SEARCH_KINDS.includes(value as SearchKind) ? value as SearchKind : "artigos";
}

// Escape PostgREST filter delimiters and SQL LIKE wildcards.
function escapePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&").replace(/[(),."]/g, " ");
}

export async function searchCampus(q: string, kind: SearchKind, page: number) {
  const term = normalizeSearch(q);
  if (!term) return { items: [], count: 0 };
  const pattern = `%${escapePattern(term)}%`;
  const start = (page - 1) * SEARCH_PAGE_SIZE;
  const end = start + SEARCH_PAGE_SIZE - 1;
  if (kind === "pessoas") {
    const { data, count, error } = await supabase.from("profiles")
      .select("id,username,full_name,bio,avatar_url", { count: "exact" })
      .or(`username.ilike.${pattern},full_name.ilike.${pattern},bio.ilike.${pattern}`)
      .order("full_name").range(start, end);
    if (error) throw error;
    return { items: (data ?? []).map(item => ({ kind: "pessoas" as const, ...item })), count: count ?? 0 };
  }
  if (kind === "comunidades") {
    const { data, count, error } = await supabase.from("communities")
      .select("id,slug,name,description,cover_url", { count: "exact" })
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .order("name").range(start, end);
    if (error) throw error;
    return { items: (data ?? []).map(item => ({ kind: "comunidades" as const, ...item })), count: count ?? 0 };
  }
  const { data, count, error } = await supabase.from("articles")
    .select("id,slug,title,subtitle,content,tags,created_at", { count: "exact" })
    .eq("published", true)
    .or(`title.ilike.${pattern},subtitle.ilike.${pattern},content.ilike.${pattern},tags.cs.{${JSON.stringify(term)}}`)
    .order("created_at", { ascending: false }).range(start, end);
  if (error) throw error;
  return { items: (data ?? []).map(item => ({ kind: "artigos" as const, ...item })), count: count ?? 0 };
}
