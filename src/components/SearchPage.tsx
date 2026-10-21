import { useState, type SubmitEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeading } from "@/components/CampusContent/PageHeading";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import {
  normalizeKind,
  normalizePage,
  normalizeSearch,
  SEARCH_KINDS,
  SEARCH_MAX_LENGTH,
  SEARCH_PAGE_SIZE,
  searchCampus,
} from "@/lib/search";

const labels = { artigos: "Notícias e artigos", pessoas: "Pessoas", comunidades: "Comunidades" };

export function SearchPage() {
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search }) as {
    q?: string;
    tipo?: string;
    pagina?: number;
  };
  const q = normalizeSearch(search.q);
  const kind = normalizeKind(search.tipo);
  const page = normalizePage(search.pagina);
  const [draft, setDraft] = useState(q);
  const [previousQ, setPreviousQ] = useState(q);
  if (q !== previousQ) {
    setPreviousQ(q);
    setDraft(q);
  }

  function go(term: string, tipo = kind, pagina = 1) {
    navigate({ to: "/buscar", search: { q: normalizeSearch(term), tipo, pagina } });
  }
  function submit(event: SubmitEvent) {
    event.preventDefault();
    go(draft);
  }

  const result = useQuery({
    queryKey: ["campus-search", q, kind, page],
    queryFn: () => searchCampus(q, kind, page),
    enabled: !!q,
    placeholderData: (previous) => previous,
  });
  const count = result.data?.count ?? 0;
  const pages = Math.ceil(count / SEARCH_PAGE_SIZE);
  const items = result.data?.items ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeading
          title="Buscar no InfoCampus"
          subtitle="Encontre notícias, artigos, pessoas e comunidades."
        />
        <form onSubmit={submit} role="search" className="flex max-w-2xl gap-2">
          <Input
            aria-label="Termo da pesquisa"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={SEARCH_MAX_LENGTH}
            placeholder="O que você procura?"
          />
          {draft && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Limpar pesquisa"
              onClick={() => {
                setDraft("");
                go("");
              }}
            >
              <X />
            </Button>
          )}
          <Button type="submit">
            <Search /> Buscar
          </Button>
        </form>
        <div role="tablist" aria-label="Tipo de resultado" className="flex flex-wrap gap-2">
          {SEARCH_KINDS.map((tipo) => (
            <Button
              key={tipo}
              type="button"
              role="tab"
              aria-selected={kind === tipo}
              variant={kind === tipo ? "default" : "outline"}
              onClick={() => go(q, tipo)}
            >
              {labels[tipo]}
            </Button>
          ))}
        </div>
        {!q ? (
          <p className="text-sm text-muted-foreground">Digite um termo para começar a pesquisa.</p>
        ) : result.isPending ? (
          <p role="status">Buscando resultados...</p>
        ) : result.isError ? (
          <div role="alert" className="space-y-3">
            <p>Não foi possível realizar a pesquisa. Tente novamente.</p>
            <Button variant="outline" onClick={() => result.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="space-y-4" aria-busy={result.isFetching}>
            <p role="status" className="text-sm text-muted-foreground">
              {count} {count === 1 ? "resultado encontrado" : "resultados encontrados"} em{" "}
              {labels[kind].toLowerCase()} para “{q}”.{result.isFetching ? " Atualizando..." : ""}
            </p>
            {count === 0 && (
              <p className="rounded-lg border border-border p-5 text-sm">
                Nenhum resultado. Experimente outro termo ou outra categoria.
              </p>
            )}
            {count > 0 && items.length === 0 && (
              <p className="text-sm">Não há resultados nesta página.</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((item) =>
                item.kind === "artigos" ? (
                  <Link
                    key={item.id}
                    to="/artigo/$slug"
                    params={{ slug: item.slug }}
                    className="rounded-lg border border-border bg-card p-5 hover:bg-accent"
                  >
                    <h2 className="font-bold">{item.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {item.subtitle || item.content}
                    </p>
                  </Link>
                ) : item.kind === "pessoas" ? (
                  <Link
                    key={item.id}
                    to="/perfil/$username"
                    params={{ username: item.username }}
                    className="rounded-lg border border-border bg-card p-5 hover:bg-accent"
                  >
                    <h2 className="font-bold">{item.full_name}</h2>
                    <p className="text-sm text-muted-foreground">@{item.username}</p>
                    <p className="mt-2 line-clamp-2 text-sm">{item.bio}</p>
                  </Link>
                ) : (
                  <div key={item.id} className="rounded-lg border border-border bg-card p-5">
                    <h2 className="font-bold">{item.name}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <Link
                      to="/comunidades"
                      className="mt-3 inline-block text-sm font-medium text-primary underline"
                    >
                      Ver comunidades
                    </Link>
                  </div>
                ),
              )}
            </div>
            {pages > 1 && (
              <nav
                aria-label="Paginação da pesquisa"
                className="flex items-center justify-between gap-3"
              >
                <Button
                  variant="outline"
                  disabled={page <= 1 || result.isFetching}
                  onClick={() => go(q, kind, page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {page} de {pages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= pages || result.isFetching}
                  onClick={() => go(q, kind, page + 1)}
                >
                  Próxima
                </Button>
              </nav>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
