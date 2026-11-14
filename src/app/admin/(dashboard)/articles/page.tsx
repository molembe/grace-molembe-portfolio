import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";
import { ResetButton } from "@/components/admin/reset-button";
import { articleFields } from "@/app/admin/fields";
import { saveArticleAction, deleteArticleAction } from "@/app/admin/actions";
import { getArticles } from "@/lib/content";

export const dynamic = "force-dynamic";

/** Back-office : articles du Tech Blog (Markdown). */
export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const { edit, new: isNew } = await searchParams;
  const articles = await getArticles();

  const items: AdminListItem[] = articles.map((a) => ({
    id: a.slug,
    title: a.title,
    subtitle: a.excerpt,
    meta: `${a.category} · ${a.date} · /blog/${a.slug}`,
    badge: "publié",
  }));

  const editing = edit ? articles.find((a) => a.slug === edit) : undefined;
  const showForm = Boolean(editing) || isNew === "1";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Articles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Corps en Markdown — le temps de lecture est calculé automatiquement, la table des matières
            est générée depuis les titres <span className="font-mono text-xs">##</span>.
          </p>
        </div>
        <ResetButton collection="articles" />
      </section>

      {showForm ? (
        <section className="card-noc p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold">{editing ? `Modifier : ${editing.title}` : "Nouvel article"}</h3>
            <Link href="/admin/articles" className="text-sm text-muted-foreground hover:text-foreground">
              Annuler
            </Link>
          </div>
          <AdminForm
            fields={articleFields}
            initial={
              editing
                ? {
                    slug: editing.slug,
                    title: editing.title,
                    category: editing.category,
                    date: editing.date,
                    excerpt: editing.excerpt,
                    related: (editing.related ?? []).join("\n"),
                    body: editing.body,
                  }
                : {}
            }
            hidden={editing ? { id: editing.slug } : {}}
            action={saveArticleAction}
            submitLabel={editing ? "Mettre à jour l'article" : "Publier l'article"}
            successRedirect="/admin/articles"
          />
        </section>
      ) : (
        <Link
          href="/admin/articles?new=1"
          className="card-noc flex items-center justify-center gap-2 border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Plus className="size-4" aria-hidden /> Rédiger un article
        </Link>
      )}

      <section>
        <h3 className="mb-4 font-display text-lg font-semibold">Articles existants</h3>
        <AdminList items={items} basePath="/admin/articles" deleteAction={deleteArticleAction} />
      </section>
    </div>
  );
}
