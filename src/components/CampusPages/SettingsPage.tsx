import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { BackButton } from "@/components/CampusContent/BackButton";
import { PageHeading } from "@/components/CampusContent/PageHeading";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Checkbox } from "@/components/UI/checkbox";
import { LoginPrompt } from "./LoginPrompt";

type Section = "security" | "delete";

export function SettingsPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>("security");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const current = String(form.get("current_password") ?? "");
    const next = String(form.get("new_password") ?? "");
    if (next.length < 8) return toast.error("A nova senha precisa ter pelo menos 8 caracteres.");
    if (next !== String(form.get("confirm_password") ?? "")) return toast.error("As senhas não coincidem.");
    if (!user?.email) return toast.error("Não foi possível validar seu e-mail.");
    setPasswordBusy(true);
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
    if (verifyError) { setPasswordBusy(false); return toast.error("A senha atual está incorreta."); }
    const { error } = await supabase.auth.updateUser({ password: next });
    setPasswordBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Senha atualizada!"); formElement.reset(); }
  }

  return <AppShell>
    <BackButton />
    <PageHeading title="Configurações" subtitle="Segurança e gerenciamento da sua conta." />
    {!user ? <LoginPrompt /> : <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
      <div className="mb-5 flex flex-wrap gap-2 border-b border-border pb-4">
        <Button type="button" variant={section === "security" ? "default" : "outline"} onClick={() => setSection("security")}>Segurança</Button>
        <Button type="button" variant={section === "delete" ? "default" : "outline"} onClick={() => setSection("delete")}>Excluir Conta</Button>
      </div>
      {section === "security" && <form onSubmit={updatePassword} className="max-w-2xl space-y-5">
        <div className="border-b border-dashed border-border pb-3"><h2 className="text-xl font-bold">Alterar senha</h2><p className="mt-1 text-sm text-muted-foreground">Confirme sua senha atual para salvar uma nova.</p></div>
        <div><Label htmlFor="current_password">Senha atual</Label><Input id="current_password" name="current_password" type="password" autoComplete="current-password" required /></div>
        <div><Label htmlFor="new_password">Nova senha</Label><Input id="new_password" name="new_password" type="password" autoComplete="new-password" required /></div>
        <div><Label htmlFor="confirm_password">Confirmar senha</Label><Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required /></div>
        <div className="flex justify-end border-t border-border pt-4"><Button type="submit" disabled={passwordBusy}>{passwordBusy ? "Salvando..." : "Salvar alterações"}</Button></div>
      </form>}
      {section === "delete" && <div className="max-w-2xl space-y-5">
        <div className="border-b border-dashed border-border pb-3"><h2 className="text-xl font-bold">Excluir conta</h2><p className="mt-1 text-sm text-muted-foreground">A exclusão da conta é permanente. Confirme seus dados para continuar.</p></div>
        <label className="flex items-start gap-3 text-sm"><Checkbox checked={deleteConfirmed} onCheckedChange={(value) => setDeleteConfirmed(value === true)} /><span>Confirmo que quero excluir minha conta.</span></label>
        <div><Label htmlFor="delete-email">Confirmar e-mail</Label><Input id="delete-email" type="email" defaultValue={user.email ?? ""} disabled={!deleteConfirmed} /></div>
        <div><Label htmlFor="delete-password">Confirmar senha</Label><Input id="delete-password" type="password" disabled={!deleteConfirmed} /></div>
        <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-muted-foreground">A exclusão da conta deve ser solicitada ao suporte do InfoCampus.</p>
        <div className="flex justify-end border-t border-border pt-4"><Button type="button" variant="destructive" disabled={!deleteConfirmed}>Excluir conta</Button></div>
      </div>}
    </div>}
  </AppShell>;
}
