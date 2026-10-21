import { Link } from "@tanstack/react-router";
import { articleImage } from "./articleImage";
import { Article } from "@/lib/content";
import { timeAgo } from "@/lib/format";

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <Link
      to="/artigo/$slug"
      params={{ slug: article.slug }}
      className="group block overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-card"
    >
      <img
        src={articleImage(article)}
        alt=""
        loading="lazy"
        width={1280}
        height={720}
        className={`w-full object-cover ${compact ? "h-32" : "h-40"}`}
      />
      <div className="p-4">
        <span className="text-[10px] font-extrabold uppercase text-primary-deep">
          {article.categories?.name ?? "Notícia"}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary-deep">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.subtitle}
        </p>
        <p className="mt-3 text-[11px] text-muted-foreground">
          {article.profiles?.full_name ?? "InfoCampus"} · {timeAgo(article.created_at)}
        </p>
      </div>
    </Link>
  );
}
