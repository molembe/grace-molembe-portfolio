import { z } from "zod";

/** Validation partagée client/serveur du formulaire de contact. */

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nom trop court.")
    .max(80, "Nom trop long (80 caractères maximum)."),
  email: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .max(120, "E-mail trop long."),
  subject: z
    .string()
    .trim()
    .min(3, "Sujet trop court.")
    .max(120, "Sujet trop long (120 caractères maximum)."),
  message: z
    .string()
    .trim()
    .min(20, "Message trop court (20 caractères minimum).")
    .max(4000, "Message trop long (4000 caractères maximum)."),
  /**
   * Honeypot : champ invisible pour les humains. Aucune contrainte ici —
   * la vérification (valeur vide attendue) se fait APRÈS validation, avec
   * une réponse de succès silencieuse pour ne pas éduquer les robots.
   */
  company: z.string().optional(),
  startedAt: z.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Neutralise les caractères de contrôle avant tout stockage / transfert. */
export function sanitizeText(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, 5000);
}
