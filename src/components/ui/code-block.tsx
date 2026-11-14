"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/** Bloc de code avec coloration syntaxique + copie (utilisé par labs et blog). */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const language = lang && lang !== "text" ? lang : "bash";

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponible (contexte non sécurisé) — copie silencieuse impossible.
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-[#0d1117]">
      <button
        type="button"
        onClick={copy}
        aria-label="Copier le code"
        className="absolute right-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 opacity-0 transition-all hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem 1.1rem",
          background: "transparent",
          fontSize: "12.5px",
          lineHeight: 1.65,
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-jetbrains), monospace" },
        }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
