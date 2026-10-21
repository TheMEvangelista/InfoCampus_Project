import { useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  ArticleCard,
  BackButton,
  CommunityTile,
  Empty,
  EventRow,
  NewsArticleCard,
  OpportunityTile,
  PageHeading,
} from "@/components/CampusContent";
import { dateLong } from "@/lib/format";
import { useCampusData } from "@/hooks/useCampusData";

export function ListingPage({
  kind,
}: {
  kind: "noticias" | "eventos" | "oportunidades" | "comunidades" | "artigos";
}) {
  const { articles: allArticles, events, opportunities, communities } = useCampusData();
  const q = String(
    (useRouterState({ select: (s) => s.location.search }) as { q?: string }).q ?? "",
  ).toLowerCase();
  const articles = {
    data: allArticles.data?.filter((a) =>
      `${a.title} ${a.subtitle ?? ""} ${a.tags.join(" ")}`.toLowerCase().includes(q),
    ),
  };
  const filteredOpportunities =
    opportunities.data?.filter(
      (o) =>
        !q || `${o.title} ${o.description} ${o.type} ${o.period ?? ""}`.toLowerCase().includes(q),
    ) ?? [];
  const config = (
    {
      noticias: ["Notícias", "Acompanhe o que acontece no IFMA."],
      eventos: ["Eventos", "Encontros, oficinas e atividades do campus."],
      oportunidades: ["Oportunidades", "Vagas, bolsas e projetos para dar o próximo passo."],
      comunidades: ["Comunidades", "Encontre pessoas com os mesmos interesses."],
      artigos: ["Artigos", "Ideias e histórias da nossa comunidade."],
    } as Record<string, [string, string]>
  )[kind]!;
  return (
    <AppShell>
      <BackButton fallbackTo="/" />
      <PageHeading title={config[0]} subtitle={config[1]} />
      {(kind === "noticias" || kind === "artigos") && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articles.data?.map((article) =>
            kind === "noticias" ? (
              <NewsArticleCard key={article.id} article={article} />
            ) : (
              <ArticleCard key={article.id} article={article} />
            ),
          )}
          {articles.data?.length === 0 && <Empty />}
        </div>
      )}
      {kind === "eventos" && (
        <div className="grid gap-4 md:grid-cols-2">
          {events.data?.map((e) => (
            <div key={e.id} className="rounded-md border border-border bg-card px-5 py-3">
              <EventRow event={e} />
              <p className="pb-2 text-xs text-muted-foreground">{dateLong(e.starts_at)}</p>
            </div>
          ))}
          {events.data?.length === 0 && <Empty />}
        </div>
      )}
      {kind === "oportunidades" && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOpportunities.map((o) => (
            <OpportunityTile item={o} key={o.id} />
          ))}
          {filteredOpportunities.length === 0 && <Empty text="Nenhuma oportunidade encontrada." />}
        </div>
      )}
      {kind === "comunidades" && (
        <div className="grid gap-3 md:grid-cols-2">
          {communities.data?.map((c) => (
            <CommunityTile community={c} key={c.id} />
          ))}
          {communities.data?.length === 0 && <Empty />}
        </div>
      )}
    </AppShell>
  );
}
