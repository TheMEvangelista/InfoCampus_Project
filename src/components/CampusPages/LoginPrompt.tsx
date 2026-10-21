import { Link } from "@tanstack/react-router";
import { Button } from "@/components/UI/button";

export function LoginPrompt() {
  return (
    <div className="py-12 text-center">
      <p className="mb-4 text-sm text-muted-foreground">
        Entre na sua conta para acessar esta página.
      </p>
      <Button asChild>
        <Link to="/entrar">Entrar</Link>
      </Button>
    </div>
  );
}
