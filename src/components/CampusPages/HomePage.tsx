import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  CommunityTile,
  Composer,
  Empty,
  NewsArticleCard,
  PostCard,
  SectionHeading,
} from "@/components/CampusContent";
import { dateLong, dayMonth } from "@/lib/format";
import { Button } from "@/components/UI/button";
import { useCampusData } from "@/hooks/useCampusData";
import { createCalendarEntries } from "@/lib/sample-events";

import campusStudents from "@/assets/Images/Image-1.jpg";
import campusOpportunity from "@/assets/Images/Image-2.jpg";
import { Article } from "@/lib/content";

const featuredCarouselContentTypes = ["news", "opportunity", "event", "article"] as const;

export function HomePage() {
  const { articles, posts, events, communities, opportunities } = useCampusData();
  const featuredCarouselRef = useRef<HTMLDivElement>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const currentMonth = new Date();
  const homepageEventCandidates = [
    ...createCalendarEntries(currentMonth),
    ...(events.data ?? []),
  ].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const homepageEvents = [20, 21, 22, 29, 30].flatMap((day) => {
    const event = homepageEventCandidates.find((candidate) => {
      const startsAt = new Date(candidate.starts_at);
      return (
        startsAt.getDate() === day &&
        startsAt.getMonth() === currentMonth.getMonth() &&
        startsAt.getFullYear() === currentMonth.getFullYear()
      );
    });
    return event ? [event] : [];
  });
  const featuredNews = articles.data?.slice(0, 2) ?? [];
  const featuredOpportunity = opportunities.data?.[0];
  const featuredSlides = [
    ...featuredNews.map((article) => ({
      type: "news" as const satisfies (typeof featuredCarouselContentTypes)[number],
      article,
    })),
    ...(featuredOpportunity
      ? [
          {
            type: "opportunity" as const satisfies (typeof featuredCarouselContentTypes)[number],
            opportunity: featuredOpportunity,
          },
        ]
      : []),
  ];

  function moveFeaturedCarousel(index: number) {
    const carousel = featuredCarouselRef.current;
    if (!carousel) return;
    const nextIndex = (index + featuredSlides.length) % featuredSlides.length;
    carousel.scrollTo({ left: nextIndex * carousel.clientWidth, behavior: "smooth" });
    setFeaturedIndex(nextIndex);
  }
  const aside = (
    <div className="space-y-5 pt-[5.75rem]">
      <div className="border-b border-border pb-4">
        <SectionHeading title="Próximos eventos" to="/eventos" />
        <div className="mt-3 space-y-2">
          {homepageEvents.map((event) => {
            const date = dayMonth(event.starts_at);
            return (
              <article
                key={event.id}
                className="flex min-h-[4.25rem] overflow-hidden rounded-lg border border-border bg-card shadow-sm"
              >
                <div className="flex w-14 shrink-0 flex-col items-center justify-center bg-peach/20">
                  <strong className="text-xl leading-5 text-destructive">{date.day}</strong>
                  <span className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                    {date.month}
                  </span>
                </div>
                <div className="min-w-0 self-center px-3 py-2">
                  <h3 className="line-clamp-2 text-xs font-bold leading-snug">{event.title}</h3>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {event.location ?? "Sem local informado"}
                  </p>
                </div>
              </article>
            );
          })}
          {homepageEvents.length === 0 && (
            <p className="py-2 text-xs text-muted-foreground">Nenhum evento nessas datas.</p>
          )}
        </div>
      </div>
      <div>
        <SectionHeading title="Comunidades" to="/comunidades" />
        {communities.data?.slice(0, 3).map((c) => (
          <div key={c.id} className="mb-2">
            <CommunityTile community={c} />
          </div>
        ))}
      </div>
    </div>
  );
  function articleImage(article: Article): string {
    return article.cover_url || campusStudents;
  }

  return (
    <AppShell aside={aside}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">
            Bem-vindo ao InfoCampus <span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O que acontece no seu campus, em um só lugar.
          </p>
        </div>
        <Composer />
        <section>
          <SectionHeading title="Destaques" to="/noticias" />
          <div className="relative">
            {featuredSlides.length > 0 ? (
              <>
                <div
                  ref={featuredCarouselRef}
                  onScroll={(event) => {
                    const node = event.currentTarget;
                    setFeaturedIndex(Math.round(node.scrollLeft / node.clientWidth));
                  }}
                  className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-label="Carrossel de destaques"
                >
                  {featuredSlides.map((slide) => {
                    const isNews = slide.type === "news";
                    const title = isNews ? slide.article.title : slide.opportunity.title;
                    const image = isNews ? articleImage(slide.article) : campusOpportunity;
                    const description = isNews
                      ? slide.article.subtitle || slide.article.content
                      : slide.opportunity.description;
                    const category = isNews
                      ? (slide.article.categories?.name ?? "Notícia")
                      : "Oportunidade";
                    const author = isNews
                      ? (slide.article.profiles?.full_name ?? "InfoCampus")
                      : "InfoCampus";
                    const date = isNews
                      ? dateLong(slide.article.created_at)
                      : "InscriÃ§ões abertas";
                    const cardClass =
                      "group relative block h-64 w-full shrink-0 snap-start overflow-hidden rounded-xl bg-muted text-left sm:h-80 lg:h-[25rem]";
                    const cardContent = (
                      <>
                        <img
                          src={image}
                          alt=""
                          width={1280}
                          height={720}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                            {category}
                          </span>
                          <h3 className="mt-1 line-clamp-2 max-w-3xl text-xl font-extrabold leading-tight sm:text-2xl">
                            {title}
                          </h3>
                          <p className="mt-2 text-xs text-white/85">
                            {author} <span className="mx-1">·</span> {date}
                          </p>
                          <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-relaxed text-white/85 sm:text-sm">
                            {description}
                          </p>
                        </div>
                      </>
                    );

                    return isNews ? (
                      <Link
                        key={`news-${slide.article.id}`}
                        to="/artigo/$slug"
                        params={{ slug: slide.article.slug }}
                        className={cardClass}
                      >
                        {cardContent}
                      </Link>
                    ) : (
                      <Link
                        key={`opportunity-${slide.opportunity.id}`}
                        to="/oportunidade/$id"
                        params={{ id: slide.opportunity.id }}
                        className={cardClass}
                      >
                        {cardContent}
                      </Link>
                    );
                  })}
                </div>
                {featuredSlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveFeaturedCarousel(featuredIndex - 1)}
                      aria-label="Destaque anterior"
                      className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow transition hover:bg-background"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFeaturedCarousel(featuredIndex + 1)}
                      aria-label="Próximo destaque"
                      className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow transition hover:bg-background"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    <div
                      className="mt-3 flex justify-center gap-2"
                      aria-label="Selecionar destaque"
                    >
                      {featuredSlides.map((slide, index) => (
                        <button
                          key={`${slide.type}-${index}`}
                          type="button"
                          onClick={() => moveFeaturedCarousel(index)}
                          aria-label={`Ir para destaque ${index + 1}`}
                          aria-current={featuredIndex === index}
                          className={`h-2.5 rounded-full transition-all ${featuredIndex === index ? "w-6 bg-primary" : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="relative h-64 overflow-hidden rounded-xl sm:h-80">
                <img
                  src={campusStudents}
                  alt="Estudantes do campus"
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/75 to-transparent" />
                <p className="absolute bottom-5 left-5 font-bold text-white">
                  Acompanhe os destaques do campus
                </p>
              </div>
            )}
          </div>
        </section>
        <section>
          <SectionHeading title="Notícias recentes" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {articles.data?.slice(0, 6).map((a) => (
              <NewsArticleCard key={a.id} article={a} />
            ))}
          </div>
          {articles.data?.length === 0 && <Empty text="Nenhuma notícia publicada ainda." />}
          <div className="mt-7 flex justify-center">
            <Button asChild className="min-w-40">
              <Link to="/noticias">
                Ver mais notícias <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
        <section>
          <SectionHeading title="Da comunidade" />
          <div className="space-y-4">
            {posts.data?.slice(0, 8).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
            {posts.data?.length === 0 && <Empty text="Seja a primeira pessoa a publicar." />}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
