"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/kit";
import { contactSchema, type ContactInput } from "@/lib/validation";

/**
 * Formulaire de contact — validation zod partagée, honeypot anti-bot,
 * délai minimal de remplissage. Aucune donnée sensible côté client.
 */
export function ContactForm() {
  const startedAt = useRef<number>(Date.now());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      company: "",
      startedAt: startedAt.current,
    },
  });

  async function onSubmit(values: ContactInput) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startedAt: startedAt.current }),
      });

      if (response.status === 429) {
        toast.error("Trop de messages envoyés. Réessayez dans une heure.");
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.message ?? "Envoi impossible. Vérifiez les champs et réessayez.");
        return;
      }

      toast.success("Message bien reçu — je reviens vers vous rapidement.");
      reset();
      startedAt.current = Date.now();
    } catch {
      toast.error("Erreur réseau. Réessayez dans un instant.");
    }
  }

  /** Filet de sécurité : toute erreur de validation inattendue reste visible. */
  function onInvalid() {
    toast.error("Certains champs requièrent votre attention.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-5">
      {/* Honeypot : invisible pour les humains, rempli par les robots. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Company
          <input type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom" error={errors.name?.message} htmlFor="contact-name">
          <input
            id="contact-name"
            type="text"
            maxLength={80}
            autoComplete="name"
            placeholder="Votre nom"
            className={inputClass(errors.name)}
            {...register("name")}
          />
        </Field>
        <Field label="E-mail" error={errors.email?.message} htmlFor="contact-email">
          <input
            id="contact-email"
            type="email"
            maxLength={120}
            autoComplete="email"
            placeholder="vous@exemple.com"
            className={inputClass(errors.email)}
            {...register("email")}
          />
        </Field>
      </div>

      <Field label="Sujet" error={errors.subject?.message} htmlFor="contact-subject">
        <input
          id="contact-subject"
          type="text"
          maxLength={120}
          placeholder="Objet de votre message"
          className={inputClass(errors.subject)}
          {...register("subject")}
        />
      </Field>

      <Field label="Message" error={errors.message?.message} htmlFor="contact-message">
        <textarea
          id="contact-message"
          rows={6}
          maxLength={4000}
          placeholder="Contexte, besoin, questions…"
          className={inputClass(errors.message)}
          {...register("message")}
        />
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden /> Envoi en cours…
          </>
        ) : (
          <>
            <Send aria-hidden /> Envoyer le message
          </>
        )}
      </Button>

      <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
        Validation stricte côté serveur · protection anti-bot · limité à 5 messages/heure.
        Aucune donnée n&apos;est partagée avec des tiers.
      </p>
    </form>
  );
}

const inputClass = (error?: { message?: string }) =>
  `w-full rounded-lg border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 ${
    error ? "border-danger/60" : "border-input focus:border-accent/50"
  }`;

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
