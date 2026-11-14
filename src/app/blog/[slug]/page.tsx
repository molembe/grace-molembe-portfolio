import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ListTree } from "lucide-react";
import { ButtonLink, Container, TechTag } from "@/components/ui/kit";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { ArticleMeta, ArticleCard } from "@/components/blog/article-card";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { Reveal } from "@/components/animations/reveal";
import { getArticle, getArticles, getRelatedArticles } from "@/lib/content";
import { extractHeadings } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return pageMetadata({ title: "Article introuvable", description: "Article introuvable.", path: "/blog" });
  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
    type: "article",
    publishedTime: article.date,
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const headings = extractHeadings(article.body);
  const related = await getRelatedArticles(article, 2);

  return (
    <article>
      <ReadingProgress />

      <header className="border-b border-border bg-card/40">
        <Container className="py-12">
          <ButtonLink href="/blog" variant="ghost" size="sm" className="-ml-3 mb-6">
            <ArrowLeft aria-hidden /> Tous les articles
          </ButtonLink>
          <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4">
            <ArticleMeta article={article} />
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_260px]">
        {/* Corps */}
        <div className="min-w-0">
          <p className="mb-8 border-l-2 border-accent/50 pl-4 text-[15px] italic leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>

          <ArticleRenderer body={article.body} />
        </div>

        {/* Sommaire */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {headings.length > 0 && (
            <nav aria-label="Table des matières" className="card-noc p-5">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <ListTree className="size-3.5 text-accent" aria-hidden />
                Sur cette page
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
                    <a
                      href={`#${h.id}`}
                      className="block text-muted-foreground transition-colors hover:text-accent"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </Container>

      {/* Articles similaires */}
      {related.length > 0 && (
        <Container className="pb-20">
          <Reveal>
            <h2 className="mb-6 font-display text-xl font-semibold">Articles similaires</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </Reveal>
        </Container>
      )}
    </article>
  );
}
