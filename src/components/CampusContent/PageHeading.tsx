export function PageHeading({
  title,
  className = "mb-5 border-b border-border pb-3",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h1 className="text-2xl leading-9 font-extrabold text-foreground md:text-3xl">{title}</h1>
    </div>
  );
}
type BackDestination =
  "/" | "/noticias" | "/eventos" | "/oportunidades" | "/comunidades" | "/mensagens";
