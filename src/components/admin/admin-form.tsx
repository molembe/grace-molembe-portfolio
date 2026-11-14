"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/app/admin/actions";

/**
 * FORMULAIRE GÉNÉRIQUE DU BACK-OFFICE.
 * Décrit par des champs sérialisables (src/app/admin/fields.ts) et branché
 * sur une server action via useActionState. Validation réelle côté serveur ;
 * les erreurs de champ sont renvoyées et affichées sous chaque champ.
 */

export interface AdminField {
  key: string;
  label: string;
  type: "text" | "textarea" | "lines" | "markdown" | "challenges" | "select" | "checkbox";
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  full?: boolean;
}

export interface AdminFormProps {
  fields: AdminField[];
  /** Valeurs initiales (édition) — les tableaux arrivent déjà joints en lignes. */
  initial?: Record<string, string | boolean>;
  /** Champs cachés (ex. { id: "xxx" } pour l'édition). */
  hidden?: Record<string, string>;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
  /** URL vers laquelle revenir après succès (vide = ne pas naviguer). */
  successRedirect?: string;
  /** Réinitialiser le formulaire après une création réussie. */
  resetOnSuccess?: boolean;
  resetKey?: string;
}

export function AdminForm({
  fields,
  initial = {},
  hidden = {},
  action,
  submitLabel = "Enregistrer",
  successRedirect,
  resetOnSuccess = false,
  resetKey,
}: AdminFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.ok) return;
    toast.success(state.message ?? "Enregistré.");
    if (resetOnSuccess) formRef.current?.reset();
    if (successRedirect) {
      router.replace(successRedirect);
    }
    router.refresh();
     
  }, [state]);

  // Clé de remontage : change quand on bascule création <-> édition.
  const key = resetKey ?? "form";

  return (
    <form ref={formRef} key={key} action={formAction} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {fields.map((field) => {
        const value = initial[field.key];
        const error = state?.errors?.[field.key];

        return (
          <div
            key={field.key}
            className={cn(
              "space-y-2",
              field.type === "checkbox" ? "sm:col-span-2" : field.full ? "sm:col-span-2" : undefined
            )}
          >
            {field.type === "checkbox" ? (
              <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div>
                  <Label htmlFor={field.key} className="cursor-pointer">
                    {field.label}
                  </Label>
                  {field.help && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
                </div>
                <Switch id={field.key} name={field.key} defaultChecked={Boolean(value)} />
              </div>
            ) : (
              <>
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="ml-1 text-danger" aria-hidden>*</span>}
                </Label>

                {field.type === "select" ? (
                  <select
                    id={field.key}
                    name={field.key}
                    defaultValue={typeof value === "string" ? value : field.options?.[0]?.value}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      error && "border-danger"
                    )}
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "text" ? (
                  <Input
                    id={field.key}
                    name={field.key}
                    type="text"
                    defaultValue={typeof value === "string" ? value : ""}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                    className={cn(error && "border-danger")}
                  />
                ) : (
                  <Textarea
                    id={field.key}
                    name={field.key}
                    rows={field.rows ?? (field.type === "lines" ? 4 : 3)}
                    defaultValue={typeof value === "string" ? value : ""}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                    className={cn(
                      "font-mono text-[13px]",
                      field.type === "markdown" && "min-h-[320px]",
                      error && "border-danger"
                    )}
                  />
                )}

                {field.help && !error && <p className="text-xs leading-relaxed text-muted-foreground">{field.help}</p>}
                {error && (
                  <p className="text-xs font-medium text-danger" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}

      {state?.message && !state.ok && (
        <div className="sm:col-span-2">
          <p className="rounded-md border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger" role="alert">
            {state.message}
          </p>
        </div>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
