import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { TechTag } from "@/components/ui/kit";
import { articleCategoryLabels } from "@/components/blog/labels";
import { formatArticleDate, computeReadingTime } from "@/lib/markdown";
import type { Article } from "@/types";

/** Carte article — date réelle, temps de lecture calculé. */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="card-noc group flex h-full flex-col p-6"
      aria-label={`Article : ${article.title}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <TechTag className="text-accent">{articleCategoryLabels[article.category]}</TechTag>
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatArticleDate(article.date)}
        </span>
      </div>

      <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{article.excerpt}</p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          {computeReadingTime(article.body)} min de lecture
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-accent">
          Lire
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function ArticleMeta({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5" aria-hidden />
        {formatArticleDate(article.date)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" aria-hidden />
        {computeReadingTime(article.body)} min de lecture
      </span>
      <TechTag className="text-accent">{articleCategoryLabels[article.category]}</TechTag>
    </div>
  );
}
