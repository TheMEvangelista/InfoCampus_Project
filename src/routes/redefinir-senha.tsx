import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — InfoCampus" },
      { name: "description", content: "Defina uma nova senha para sua conta InfoCampus." },
      { property: "og:title", content: "Redefinir senha — InfoCampus" },
      { property: "og:description", content: "Defina uma nova senha para sua conta InfoCampus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // 1. Escuta evento PASSWORD_RECOVERY
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "PASSWORD_RECOVERY" || newSession) {
        setIsRecoverySession(true);
      }
      setCheckingToken(false);
    });

    // 2. Checa se ha hash ou sessao atual
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setIsRecoverySession(true);
      setCheckingToken(false);
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setIsRecoverySession(true);
        }
        setCheckingToken(false);
      });
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("A nova senha deve ter no mínimo 6 caracteres.");
    }
    if (password !== confirmPassword) {
      return toast.error("As senhas não coincidem. Digite a mesma senha nos dois campos.");
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      toast.error("Não foi possível atualizar a senha.", {
        description: error.message,
      });
      return;
    }

    setSuccess(true);
    toast.success("Senha alterada com sucesso!");
    setTimeout(() => {
      navigate({ to: "/", replace: true });
    }, 2500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/40 px-4 py-10">
      <div className="w-full max-w-[28rem]">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo
            className="gap-4"
            iconClassName="h-16 w-16 sm:h-20 sm:w-20"
            nameClassName="text-4xl leading-none"
          />
        </Link>

        <Card className="shadow-card">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Definir nova senha</CardTitle>
            <CardDescription>
              Crie uma nova senha de acesso para sua conta institucional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkingToken || authLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Verificando link de recuperação...
              </p>
            ) : success ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Sua senha foi redefinida com sucesso!
                </p>
                <p className="text-xs text-muted-foreground">
                  Redirecionando para a página inicial...
                </p>
                <Button asChild className="w-full">
                  <Link to="/">Ir para o início</Link>
                </Button>
              </div>
            ) : !isRecoverySession && !session ? (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  O link de recuperação de senha é inválido, expirou ou já foi utilizado.
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/recuperar-senha">Solicitar novo link</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Salvando nova senha..." : "Salvar nova senha"}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    to="/entrar"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:underline"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
