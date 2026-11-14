import { MailOpen, MailX } from "lucide-react";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";
import { deleteMessageAction } from "@/app/admin/actions";
import { readMessages } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Boîte de réception locale des messages du formulaire de contact. */
export default async function AdminMessagesPage() {
  const messages = await readMessages();

  const items: AdminListItem[] = messages.map((m) => ({
    id: m.receivedAt,
    title: `${m.subject}`,
    subtitle: `${m.message.slice(0, 220)}${m.message.length > 220 ? "…" : ""}`,
    meta: `${new Date(m.receivedAt).toLocaleString("fr-FR")} · ${m.name} <${m.email}>`,
    badge: "nouveau",
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-semibold">Messages reçus</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages envoyés via le formulaire de contact — stockés localement dans{" "}
          <span className="font-mono text-xs">.data/messages.jsonl</span> (aucun tiers). Répondez par
          e-mail directement aux adresses indiquées.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-noc p-5 text-center">
          <MailOpen className="mx-auto size-5 text-accent" aria-hidden />
          <p className="mt-2 font-display text-2xl font-bold">{messages.length}</p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">messages</p>
        </div>
        <div className="card-noc p-5 text-center">
          <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground">
            Pour brancher un envoi SMTP ou une API Django REST plus tard, le schéma d&apos;un message est
            déjà documenté dans <span className="text-accent">docs/DEPLOYMENT.md</span>.
          </p>
        </div>
        <div className="card-noc p-5 text-center">
          <MailX className="mx-auto size-5 text-muted-foreground" aria-hidden />
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Suppression définitive après traitement
          </p>
        </div>
      </div>

      <AdminList
        items={items}
        basePath="/admin/messages"
        deleteAction={deleteMessageAction}
        emptyMessage="Aucun message reçu pour l'instant — le formulaire de contact est opérationnel."
      />
    </div>
  );
}
