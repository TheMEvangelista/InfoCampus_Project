import { Link } from "@tanstack/react-router";
import { ExternalLink, FileText, Paperclip } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BackButton, Empty, OpportunityTile, SectionHeading } from "@/components/CampusContent";
import { safeUrl } from "@/lib/url";
import { dateLong } from "@/lib/format";
import { Button } from "@/components/UI/button";
import { useCampusData } from "@/hooks/useCampusData";

export function OpportunityPage({ id }: { id: string }) {
  const { opportunities } = useCampusData();
  const item = opportunities.data?.find((o) => o.id === id);
  const others = opportunities.data?.filter((o) => o.id !== id).slice(0, 4) ?? [];
  const editalUrl = item ? safeUrl(item.edital_url) : null;
  const attachments = item
    ? (item.attachments ??
      (item.attachment_urls ?? []).map((url, index) => ({ name: `Anexo ${index + 1}`, url })))
    : [];
  const registrationUrl = item ? safeUrl(item.registration_url) : null;
  const detailsUrl = item ? safeUrl(item.link) : null;

  return (
    <AppShell>
      {!item ? (
        <Empty text="Oportunidade não encontrada." />
      ) : (
        <article className="mx-auto max-w-5xl">
          <BackButton fallbackTo="/oportunidades" />
          <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div className="min-w-0">
              <Link
                to="/oportunidades"
                className="text-xs font-extrabold uppercase tracking-wide text-secondary hover:underline"
              >
                {item.type}
              </Link>
              <h1 className="mt-2 text-xl font-extrabold leading-tight text-foreground md:text-3xl">
                {item.title}
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            {item.deadline && (
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">InscriÃ§ões:</span>
                <span>{item.period ? item.period : `Até ${dateLong(item.deadline)}`}</span>
              </p>
            )}
            <p className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Categoria:</span>
              <span className="uppercase text-secondary font-bold">{item.type}</span>
            </p>
          </div>

          <section className="mt-8">
            <SectionHeading title="Sobre a oportunidade" />
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
              {item.description}
            </p>
          </section>

          {(item.edital_title || editalUrl || attachments.length > 0) && (
            <section className="mt-8 border-t border-border pt-6">
              <SectionHeading title="Documentos e Anexos" />
              <div className="space-y-3">
                {(item.edital_title || editalUrl) && (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-deep">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          {item.edital_title || "Arquivo do Edital de Abertura"}
                        </p>
                        <p className="text-xs text-muted-foreground">Arquivo principal do edital</p>
                      </div>
                    </div>
                    {editalUrl && (
                      <Button asChild size="sm" variant="outline" className="gap-1.5 shrink-0">
                        <a href={editalUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" /> Acessar
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {attachments.map((anexo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-xs font-medium">{anexo.name}</span>
                    </div>
                    {anexo.url && (
                      <a
                        href={safeUrl(anexo.url) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-primary-deep hover:underline"
                      >
                        Baixar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(registrationUrl || detailsUrl) && (
            <div className="mt-8 flex gap-3">
              <Button
                asChild
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-deep"
              >
                <a
                  href={registrationUrl ?? detailsUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {registrationUrl ? "Acessar inscrições" : "Saiba mais"}{" "}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}

          {others.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <SectionHeading title="Outras oportunidades" to="/oportunidades" />
              <div className="grid gap-4 md:grid-cols-2">
                {others.map((o) => (
                  <OpportunityTile item={o} key={o.id} />
                ))}
              </div>
            </section>
          )}
        </article>
      )}
    </AppShell>
  );
}
