const feedbackUrl = "https://forms.gle/F8owKRXEQ57SmbeWA";

export function FeedbackBanner() {
  return (
    <aside
      aria-label="Avalie a plataforma"
      className="fixed left-1/2 top-20 z-30 flex w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col gap-1 rounded-lg bg-primary px-3 py-2 text-primary-foreground shadow-lg sm:w-lg"
    >
      <div>
        <p className="text-xs font-semibold">O que você acha da plataforma?</p>
        <p className="mt-0.5 text-[11px] leading-snug text-primary-foreground/90">
          Sua opinião é muito importante. Acesse o formulário abaixo e deixe sua avaliação.
        </p>
      </div>

      <a
        href={feedbackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="self-end rounded-md bg-primary-foreground px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        Avaliar plataforma
      </a>
    </aside>
  );
}
