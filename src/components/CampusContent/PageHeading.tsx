export function PageHeading({ title, subtitle }: { title: string; subtitle?: string | undefined }) {
  return (
    <div className="mb-7 border-b border-border pb-5">
      <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
type BackDestination =
  "/" | "/noticias" | "/eventos" | "/oportunidades" | "/comunidades" | "/mensagens";
