import { useState, SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PageHeading } from "@/components/CampusContent/PageHeading";
import { useAuth, useProfile } from "@/lib/auth";
import { isSafeHttpUrl } from "@/lib/url";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { LoginPrompt } from "./LoginPrompt";

export function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    const avatar = String(form.get("avatar_url") ?? "").trim();
    if (avatar && !isSafeHttpUrl(avatar))
      return toast.error("Link da foto inválido", {
        description: "Use um endereço que comece com http:// ou https://.",
      });
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(form.get("full_name") ?? ""),
        bio: String(form.get("bio") ?? ""),
        avatar_url: avatar || null,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Perfil atualizado!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  }
  return (
    <AppShell>
      <PageHeading title="ConfiguraÃ§ões" subtitle="Atualize suas informaÃ§ões de perfil." />
      {!user ? (
        <LoginPrompt />
      ) : (
        profile && (
          <form key={profile.id} onSubmit={save} className="max-w-xl space-y-4">
            <div>
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
            </div>
            <div>
              <Label htmlFor="bio">Sobre você</Label>
              <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} />
            </div>
            <div>
              <Label htmlFor="avatar_url">Link da foto de perfil</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                type="url"
                defaultValue={profile.avatar_url ?? ""}
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Salvando..." : "Salvar alteraÃ§ões"}
            </Button>
          </form>
        )
      )}
    </AppShell>
  );
}
