import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileUp, LoaderCircle, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { BackButton } from "@/components/CampusContent/BackButton";
import { PageHeading } from "@/components/CampusContent/PageHeading";
import { useAuth, useProfile } from "@/lib/auth";
import { safeUrl, isSafeHttpUrl } from "@/lib/url";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import { LoginPrompt } from "./LoginPrompt";

export function EditProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  useEffect(() => { setAvatarUrl(profile?.avatar_url ?? null); }, [profile?.id, profile?.avatar_url]);

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return toast.error("Escolha uma imagem JPEG, PNG, WebP ou GIF.");
    if (file.size > 2 * 1024 * 1024) return toast.error("A foto de perfil deve ter no máximo 2 MB.");
    setUploadBusy(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/profile/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("post-media").upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    setUploadBusy(false);
    if (error) return toast.error("Não foi possível enviar a foto.", { description: error.message });
    setAvatarUrl(supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl);
    toast.success("Foto carregada!");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !profile) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!email) return toast.error("Informe seu e-mail.");
    if (avatarUrl && !isSafeHttpUrl(avatarUrl)) return toast.error("O link da foto não é válido.");
    const links = Object.fromEntries(["curriculo", "instagram", "tiktok", "twitter"].map((key) => {
      const value = String(form.get(key) ?? "").trim();
      return [key, value || null];
    }));
    for (const [key, value] of Object.entries(links)) {
      if (value && !isSafeHttpUrl(value)) return toast.error(`Informe um link HTTP ou HTTPS válido para ${key === "curriculo" ? "o currículo" : key}.`);
      if (value && value.length > 2048) return toast.error("Os links devem ter no máximo 2048 caracteres.");
    }
    setSaveBusy(true);
    const { error } = await supabase.from("profiles").update({
      full_name: String(form.get("full_name") ?? "").trim(),
      avatar_url: avatarUrl,
      course: String(form.get("course") ?? "").trim() || null,
      cohort: String(form.get("cohort") ?? "").trim() || null,
      bio: String(form.get("bio") ?? "").trim() || null,
      links,
    }).eq("id", user.id);
    if (error) { setSaveBusy(false); return toast.error(error.message); }
    if (email !== (user.email ?? "")) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) { setSaveBusy(false); return toast.error("As informações foram salvas, mas não foi possível atualizar o e-mail.", { description: emailError.message }); }
      toast.success("Informações salvas. Confirme o novo e-mail pelo link enviado.");
    } else toast.success("Informações do perfil atualizadas!");
    setSaveBusy(false);
    await Promise.all([queryClient.invalidateQueries({ queryKey: ["profile"] }), queryClient.invalidateQueries({ queryKey: ["public-profile"] })]);
  }

  return <AppShell>
    <BackButton />
    <PageHeading title="Editar perfil" subtitle="Atualize suas informações pessoais e acadêmicas." />
    {!user ? <LoginPrompt /> : profile && <form key={profile.id} onSubmit={save} className="rounded-xl border border-border bg-card p-5 shadow-card sm:p-7">
      <section className="space-y-5">
        <div className="border-b border-dashed border-border pb-3"><h2 className="text-lg font-bold">Informações pessoais</h2></div>
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-border p-4">
          <Avatar className="h-16 w-16"><AvatarImage src={safeUrl(avatarUrl) ?? undefined}/><AvatarFallback><UserRound className="h-7 w-7"/></AvatarFallback></Avatar>
          <div className="min-w-48 flex-1"><p className="text-sm font-semibold">Foto de perfil</p><p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP ou GIF. Máximo de 2 MB.</p></div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void uploadAvatar(event)} />
          <Button type="button" variant="outline" disabled={uploadBusy} onClick={() => fileRef.current?.click()}>{uploadBusy ? <LoaderCircle className="animate-spin"/> : <FileUp/>}{uploadBusy ? "Enviando..." : "Escolher foto"}</Button>
          {avatarUrl && <Button type="button" variant="ghost" aria-label="Remover foto de perfil" onClick={() => setAvatarUrl(null)}><Trash2/>Remover</Button>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="full_name">Nome completo</Label><Input id="full_name" name="full_name" defaultValue={profile.full_name} maxLength={100} required /></div>
          <div><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" defaultValue={user.email ?? ""} required /></div>
        </div>
      </section>
      <section className="mt-7 space-y-5 border-t border-border pt-6">
        <div className="border-b border-dashed border-border pb-3"><h2 className="text-lg font-bold">Informações acadêmicas</h2></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="course">Curso</Label><Input id="course" name="course" maxLength={120} defaultValue={profile.course ?? ""}/></div><div><Label htmlFor="cohort">Turma</Label><Input id="cohort" name="cohort" maxLength={80} defaultValue={profile.cohort ?? ""}/></div></div>
        <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" name="bio" maxLength={500} defaultValue={profile.bio ?? ""}/></div>
      </section>
      <section className="mt-7 space-y-5 border-t border-border pt-6">
        <div className="border-b border-dashed border-border pb-3"><h2 className="text-lg font-bold">Links</h2><p className="mt-1 text-sm text-muted-foreground">Adicione links públicos para seu currículo e redes sociais.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {([ ["curriculo", "Currículo"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["twitter", "Twitter / X"] ] as const).map(([key, label]) => {
            const savedLinks = profile.links && typeof profile.links === "object" && !Array.isArray(profile.links) ? profile.links as Record<string, unknown> : {};
            return <div key={key}><Label htmlFor={key}>{label}</Label><Input id={key} name={key} type="url" inputMode="url" placeholder="https://..." maxLength={2048} defaultValue={typeof savedLinks[key] === "string" ? savedLinks[key] as string : ""}/></div>;
          })}
        </div>
      </section>
      <div className="mt-7 flex justify-end border-t border-border pt-5"><Button type="submit" disabled={saveBusy || uploadBusy}>{saveBusy ? "Salvando..." : "Salvar alterações"}</Button></div>
    </form>}
  </AppShell>;
}
