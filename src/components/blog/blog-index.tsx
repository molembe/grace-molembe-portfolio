"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/blog/article-card";
import { articleCategories } from "@/content/blog";
import type { Article } from "@/types";
import { cn } from "@/lib/utils";

/** Index du blog : recherche instantanée + filtres par catégorie. */
export function BlogIndex({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const matchCategory = category === "all" || a.category === category;
      const matchQuery = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [articles, query, category]);

  return (
    <div>
      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un article…"
          aria-label="Rechercher un article"
          className="h-10 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent/50"
        />
      </div>

      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        {articleCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            aria-pressed={category === cat.id}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-lg border px-3 font-mono text-xs transition-colors",
              category === cat.id
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border bg-surface text-muted-foreground hover:border-accent/30 hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Aucun article ne correspond à cette recherche. Les prochaines publications couvriront les
          autres catégories du site.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}

      <p className="mt-6 font-mono text-xs text-muted-foreground" aria-live="polite">
        {filtered.length} article(s) affiché(s) sur {articles.length}
      </p>
    </div>
  );
}
