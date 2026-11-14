"use client";

import { useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { DiagramRenderer } from "@/components/diagrams/diagram-renderer";
import type { DiagramSpec } from "@/types";
import { cn } from "@/lib/utils";

/** Visionneuse interactive : zoom boutons + déplacement à la souris/doigt. */
export function DiagramViewer({ spec, className }: { spec: DiagramSpec; className?: string }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(2)));
  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <figure className={cn("card-noc overflow-hidden p-0", className)}>
      {/* Barre d'outils */}
      <figcaption className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-accent">{spec.title}</p>
          {spec.description && (
            <p className="truncate text-xs text-muted-foreground">{spec.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Contrôles du diagramme">
          <ViewerButton label="Zoom arrière" onClick={zoomOut}>
            <Minus className="size-4" />
          </ViewerButton>
          <span className="w-10 text-center font-mono text-[11px] text-muted-foreground" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <ViewerButton label="Zoom avant" onClick={zoomIn}>
            <Plus className="size-4" />
          </ViewerButton>
          <ViewerButton label="Réinitialiser la vue" onClick={reset}>
            <RotateCcw className="size-4" />
          </ViewerButton>
        </div>
      </figcaption>

      {/* Zone de dessin */}
      <div
        className="touch-none overflow-hidden bg-background p-2"
        style={{ cursor: scale > 1 ? "grab" : "default" }}
        onPointerDown={(e) => {
          if (scale <= 1) return;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          dragging.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
          setIsDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          setOffset({
            x: dragging.current.baseX + (e.clientX - dragging.current.startX),
            y: dragging.current.baseY + (e.clientY - dragging.current.startY),
          });
        }}
        onPointerUp={() => {
          dragging.current = null;
          setIsDragging(false);
        }}
        onPointerLeave={() => {
          dragging.current = null;
          setIsDragging(false);
        }}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <DiagramRenderer spec={spec} />
        </div>
      </div>
    </figure>
  );
}

function ViewerButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
    >
      {children}
    </button>
  );
}
