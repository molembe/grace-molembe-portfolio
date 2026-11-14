import ReactMarkdown from "react-markdown";
import { CodeBlock } from "@/components/ui/code-block";
import { slugify } from "@/lib/markdown";
import { isValidElement, type ReactNode } from "react";

/** Rendu markdown des articles : ancres h2/h3, code coloré, liens sûrs. */

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

export function ArticleRenderer({ body }: { body: string }) {
  return (
    <div className="space-y-5 text-[15.5px] leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
      <ReactMarkdown
        components={{
          h2: ({ children }) => {
            const id = slugify(extractText(children));
            return (
              <h2 id={id} className="scroll-mt-24 pt-4 font-display text-2xl font-semibold text-foreground">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = slugify(extractText(children));
            return (
              <h3 id={id} className="scroll-mt-24 pt-2 font-display text-lg font-semibold text-foreground">
                {children}
              </h3>
            );
          },
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                {children}
              </a>
            );
          },
          ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-5">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/50 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border" />,
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-muted px-3 py-2 text-left font-mono text-xs uppercase">{children}</th>
          ),
          td: ({ children }) => <td className="border-b border-border px-3 py-2">{children}</td>,
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className ?? "");
            const text = extractText(children);
            if (match) {
              return <CodeBlock code={text.replace(/\n$/, "")} lang={match[1]} />;
            }
            return (
              <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[13px] text-accent">
                {children}
              </code>
            );
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
