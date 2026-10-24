import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth, INSTITUTIONAL_DOMAIN } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Card, CardContent } from "@/components/UI/card";
import { useHandleLogin } from "./functions/useHandleLogin";
import { useHandleSignup } from "./functions/useHandleSignup";
import { useRedirectAuthenticatedUser } from "./functions/useRedirectAuthenticatedUser";

export function EntrarPage() {
  const { user } = useAuth();
  useRedirectAuthenticatedUser(Boolean(user));
  const [loading, setLoading] = useState(false);
  const handleLogin = useHandleLogin(setLoading);
  const handleSignup = useHandleSignup(setLoading);

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/40 px-4 py-10">
      <div className="w-full max-w-[30.8rem]">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo
            className="gap-4"
            iconClassName="h-16 w-16 sm:h-24 sm:w-24"
            nameClassName="text-4xl leading-none sm:text-[3.375rem]"
          />
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
                    <Input id="signup-password" name="password" type="password" minLength={8} required />
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
