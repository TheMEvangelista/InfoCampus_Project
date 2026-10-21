import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Opportunity } from "@/lib/content";
import { dateLong } from "@/lib/format";

const opportunityLabels: Record<string, string> = {
  estagio: "Estágio",
  emprego: "Emprego",
  bolsa: "Bolsa",
  pesquisa: "Pesquisa",
  monitoria: "Monitoria",
};

export function OpportunityTile({ item }: { item: Opportunity }) {
  const label = (opportunityLabels[item.type] ?? item.type).toUpperCase();

  return (
    <Link
      to="/oportunidade/$id"
      params={{ id: item.id }}
      className="group block rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-card"
    >
      <article className="flex min-h-full flex-col justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-secondary">
            {label}
          </span>
          <h2 className="mt-1.5 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary-deep">
            {item.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-2">
          {item.deadline && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Inscrições até {dateLong(item.deadline)}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-deep group-hover:underline">
              Ver detalhes{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
            {item.period && (
              <span className="text-[10px] font-medium text-muted-foreground/80">
                Vigência 2026/2027
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
