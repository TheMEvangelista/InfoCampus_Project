import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IFMA_SITE, INSTITUTIONAL_DOMAIN, isInstitutionalEmail, useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — InfoCampus" },
      { name: "description", content: "Acesse o InfoCampus com seu e-mail institucional do IFMA." },
      { property: "og:title", content: "Entrar — InfoCampus" },
      {
        property: "og:description",
        content: "Acesse o InfoCampus com seu e-mail institucional do IFMA.",
      },
    ],
  }),
  component: EntrarPage,
});

function EntrarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: "/", replace: true });
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    if (!isInstitutionalEmail(email)) {
      toast.error("Você não é aluno do IFMA", {
        description: `Use um e-mail @${INSTITUTIONAL_DOMAIN}. Redirecionando para o site do IFMA...`,
      });
      setTimeout(() => {
        window.location.href = IFMA_SITE;
      }, 2500);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    navigate({ to: "/" });
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("full_name") ?? "").trim();
    const username = String(form.get("username") ?? "")
      .trim()
      .toLowerCase();
    const avatarUrl = String(form.get("avatar_url") ?? "").trim();

    if (!isInstitutionalEmail(email)) {
      toast.error("Cadastro somente para estudantes do IFMA", {
        description: `Use um e-mail @${INSTITUTIONAL_DOMAIN}.`,
      });
      setTimeout(() => {
        window.location.href = IFMA_SITE;
      }, 2500);
      return;
    }
    if (fullName.length < 3) return toast.error("Informe seu nome completo.");
    if (username.length < 3) return toast.error("Escolha um nome de usuário com 3+ caracteres.");
    if (password.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, username, avatar_url: avatarUrl || null },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível cadastrar", { description: error.message });
      return;
    }
    toast.success("Confira seu e-mail institucional para confirmar a conta.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/40 px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex justify-center">
          <Logo />
        </Link>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4 pt-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail institucional</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      placeholder={`nome@${INSTITUTIONAL_DOMAIN}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input id="login-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  <Link
                    to="/recuperar-senha"
                    className="block text-center text-sm text-muted-foreground underline"
                  >
                    Esqueci minha senha
                  </Link>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="space-y-4 pt-4" onSubmit={handleSignup}>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome completo</Label>
                    <Input id="full_name" name="full_name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input id="username" name="username" required placeholder="ana.souza" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail institucional</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      placeholder={`nome@${INSTITUTIONAL_DOMAIN}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Foto de perfil (link)</Label>
                    <Input id="avatar_url" name="avatar_url" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input id="signup-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Acesso exclusivo para estudantes com e-mail @{INSTITUTIONAL_DOMAIN}.
        </p>
      </div>
    </div>
  );
}
