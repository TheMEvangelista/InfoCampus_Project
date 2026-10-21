import { useState, SubmitEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PageHeading } from "@/components/CampusContent/PageHeading";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: SubmitEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Confira sua caixa de entrada para recuperar sua senha.");
  }
  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <PageHeading
          title="Recuperar senha"
          subtitle="Enviaremos um link para o seu e-mail institucional."
        />
        <form onSubmit={submit} className="space-y-4">
          <Label htmlFor="reset-email">E-mail institucional</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
