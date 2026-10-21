import { useState, SubmitEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PageHeading } from "@/components/CampusContent/PageHeading";
import { content } from "@/lib/content";
import { useAuth, useIsStaff, useProfile } from "@/lib/auth";
import { isSafeHttpUrl } from "@/lib/url";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { LoginPrompt } from "./LoginPrompt";

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
