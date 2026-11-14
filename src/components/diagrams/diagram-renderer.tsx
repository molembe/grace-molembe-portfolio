import type { DiagramEdge, DiagramNode, DiagramSpec } from "@/types";

/**
 * RENDU SVG DÉCLARATIF — les topologies sont des données (voir topologies.ts),
 * le rendu est déterministe et thémable (variables CSS → compatible clair/sombre).
 */

const edgeStroke: Record<string, string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  muted: "var(--input)",
};

const kindGlyph: Record<string, string> = {
  router: "R",
  switch: "S",
  server: "SRV",
  firewall: "FW",
  host: "H",
  cloud: "",
};

function nodeW(node: DiagramNode): number {
  return node.w ?? 132;
}
function nodeH(node: DiagramNode): number {
  return node.h ?? 44;
}
function center(node: DiagramNode): { cx: number; cy: number } {
  return { cx: node.x + nodeW(node) / 2, cy: node.y + nodeH(node) / 2 };
}

export function DiagramRenderer({ spec }: { spec: DiagramSpec }) {
  const nodeMap = new Map(spec.nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label={`Diagramme : ${spec.title}`}
    >
      <defs>
        {(["primary", "accent", "muted"] as const).map((tone) => (
          <marker
            key={tone}
            id={`arrow-${spec.id}-${tone}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill={edgeStroke[tone]} />
          </marker>
        ))}
      </defs>

      {/* Zones (VRF, clients, groupes) */}
      {spec.groups?.map((g) => (
        <g key={g.id}>
          <rect
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h}
            rx={12}
            fill="var(--muted)"
            fillOpacity="0.35"
            stroke="var(--input)"
            strokeDasharray="5 5"
          />
          <text x={g.x + 12} y={g.y + 20} className="font-mono" fontSize="11" fill="var(--accent)">
            {g.label}
          </text>
        </g>
      ))}

      {/* Liaisons */}
      {spec.edges.map((edge: DiagramEdge, i) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;
        const a = center(from);
        const b = center(to);
        const stroke = edgeStroke[edge.tone ?? "muted"];
        const mx = (a.cx + b.cx) / 2;
        const my = (a.cy + b.cy) / 2;
        return (
          <g key={`${edge.from}-${edge.to}-${i}`}>
            <line
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke={stroke}
              strokeWidth="1.5"
              strokeDasharray={edge.dashed ? "5 4" : undefined}
              markerEnd={`url(#arrow-${spec.id}-${edge.tone ?? "muted"})`}
              markerStart={`url(#arrow-${spec.id}-${edge.tone ?? "muted"})`}
            />
            {edge.label && (
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                className="font-mono"
                fontSize="10"
                fill="var(--muted-foreground)"
                stroke="var(--background)"
                strokeWidth="3.5"
                paintOrder="stroke"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nœuds */}
      {spec.nodes.map((node) => {
        const w = nodeW(node);
        const h = nodeH(node);
        const isCloud = node.kind === "cloud";
        const glyph = kindGlyph[node.kind];
        const stroke =
          node.kind === "firewall"
            ? "var(--warning)"
            : node.kind === "router"
              ? "var(--primary)"
              : "var(--border)";

        return (
          <g key={node.id}>
            {isCloud ? (
              <ellipse
                cx={node.x + w / 2}
                cy={node.y + h / 2}
                rx={w / 2}
                ry={h / 2}
                fill="var(--muted)"
                fillOpacity="0.4"
                stroke="var(--input)"
              />
            ) : (
              <rect
                x={node.x}
                y={node.y}
                width={w}
                height={h}
                rx={9}
                fill="var(--surface)"
                stroke={stroke}
                strokeWidth="1.5"
              />
            )}

            {glyph && (
              <>
                <circle cx={node.x + 18} cy={node.y + h / 2} r="10" fill="var(--accent)" fillOpacity="0.12" stroke="var(--accent)" strokeOpacity="0.35" />
                <text
                  x={node.x + 18}
                  y={node.y + h / 2 + 3.5}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={glyph.length > 2 ? "6.5" : "8.5"}
                  fill="var(--accent)"
                  fontWeight="700"
                >
                  {glyph}
                </text>
              </>
            )}

            <text
              x={glyph ? node.x + 34 : node.x + w / 2}
              y={node.y + (node.sub ? h / 2 - 4 : h / 2 + 4)}
              textAnchor={glyph ? "start" : "middle"}
              className="font-mono"
              fontSize="11.5"
              fontWeight="600"
              fill="var(--foreground)"
            >
              {node.label}
            </text>
            {node.sub && (
              <text
                x={glyph ? node.x + 34 : node.x + w / 2}
                y={node.y + h / 2 + 11}
                textAnchor={glyph ? "start" : "middle"}
                className="font-mono"
                fontSize="9"
                fill="var(--muted-foreground)"
              >
                {node.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
