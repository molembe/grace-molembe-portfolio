"use client";

import { useActionState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/admin/actions";

/** Formulaire de connexion au back-office (mot de passe unique + rate limit). */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe administrateur</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={Boolean(state?.message)}
          className={cnInput(state?.message)}
        />
      </div>

      {state?.message && (
        <p className="rounded-md border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LockKeyhole className="size-4" aria-hidden />}
        {pending ? "Vérification…" : "Se connecter"}
      </Button>
    </form>
  );
}

function cnInput(hasError?: string) {
  return hasError ? "border-danger" : undefined;
}
