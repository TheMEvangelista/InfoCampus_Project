import { Link } from "@tanstack/react-router";
import { articleImage } from "./articleImage";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Article } from "@/lib/content";

export function NewsArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to="/artigo/$slug"
      params={{ slug: article.slug }}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <img
        src={articleImage(article)}
        alt=""
        loading="lazy"
        width={1280}
        height={720}
        className="h-44 w-full object-cover"
      />
      <div className="flex min-h-36 flex-col p-4">
        <h3 className="line-clamp-3 text-sm font-bold leading-snug text-foreground group-hover:text-primary-deep">
          {article.title}
        </h3>
        {article.subtitle && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {article.subtitle}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-primary-deep">
          Ler mais{" "}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
