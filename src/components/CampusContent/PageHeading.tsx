export function PageHeading({
  title,
  subtitle,
  className = "mb-7 border-b border-border pb-5",
}: {
  title: string;
  subtitle?: string | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
type BackDestination =
  "/" | "/noticias" | "/eventos" | "/oportunidades" | "/comunidades" | "/mensagens";
