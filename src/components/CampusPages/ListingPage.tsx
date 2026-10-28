import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
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
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/UI/input";

export function ListingPage({
  kind,
}: {
  kind: "noticias" | "eventos" | "oportunidades" | "comunidades" | "artigos";
}) {
  const { articles: allArticles, events, opportunities, communities } = useCampusData();
  const { user } = useAuth();
  const [communitySearch, setCommunitySearch] = useState("");
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
      noticias: "Notícias",
      eventos: "Eventos",
      oportunidades: "Oportunidades",
      comunidades: "Comunidades",
      artigos: "Artigos",
    } as Record<string, string>
  )[kind]!;
  return (
    <AppShell>
      <BackButton fallbackTo="/" />
      <PageHeading title={config} />
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
        <div className="space-y-6">
          {(() => {
            const joined = (communities.data ?? []).filter((community) =>
              community.community_members.some((member) => member.user_id === user?.id),
            );
            const search = communitySearch.trim().toLocaleLowerCase("pt-BR");
            const available = (communities.data ?? []).filter(
              (community) =>
                !community.community_members.some((member) => member.user_id === user?.id) &&
                (!search ||
                  `${community.name} ${community.description ?? ""}`
                    .toLocaleLowerCase("pt-BR")
                    .includes(search)),
            );
            return (
              <>
                <section className="space-y-3">
                  <h2 className="text-sm font-bold">Suas comunidades</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {joined.map((community) => (
                      <CommunityTile
                        community={community}
                        key={community.id}
                        showMembershipAction={false}
                      />
                    ))}
                    {joined.length === 0 && (
                      <Empty text="Você ainda não participa de comunidades." />
                    )}
                  </div>
                </section>
                <section className="space-y-3 border-t border-border pt-5">
                  <h2 className="text-sm font-bold">Descobrir comunidades</h2>
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      aria-label="Buscar comunidades que você ainda não participa"
                      placeholder="Buscar comunidades"
                      value={communitySearch}
                      onChange={(event) => setCommunitySearch(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {available.map((community) => (
                      <CommunityTile community={community} key={community.id} />
                    ))}
                    {available.length === 0 && (
                      <Empty
                        text={
                          search
                            ? "Nenhuma comunidade encontrada."
                            : "Você já participa de todas as comunidades."
                        }
                      />
                    )}
                  </div>
                </section>
              </>
            );
          })()}
        </div>
      )}
    </AppShell>
  );
}
