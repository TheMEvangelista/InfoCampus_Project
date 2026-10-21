import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type BackDestination =
  "/" | "/noticias" | "/eventos" | "/oportunidades" | "/comunidades" | "/mensagens";

export function BackButton({
  fallbackTo = "/",
  label = "Voltar",
}: {
  fallbackTo?: BackDestination;
  label?: string;
}) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        if (router.history.canGoBack()) router.history.back();
        else void router.navigate({ to: fallbackTo });
      }}
      className="mb-4 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Button>
  );
}
