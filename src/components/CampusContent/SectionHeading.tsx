import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  title,
  to,
  action = "Ver todos",
}: {
  title: string;
  to?: "/noticias" | "/eventos" | "/oportunidades" | "/comunidades" | "/artigos";
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
      {to && (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary-deep hover:underline"
        >
          {action}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
