import React, { useMemo } from "react";
import { MapNode } from "@/types/navigation";

interface ConnectionLayerProps {
  nodes: MapNode[];
  isAdminMode?: boolean;
  selectedNodeId?: string | null;
  onConnectionClick?: (nodeId1: string, nodeId2: string) => void;
}

export function ConnectionLayer({
  nodes,
  isAdminMode = false,
  selectedNodeId,
  onConnectionClick,
}: ConnectionLayerProps) {
  // Get all unique connections
  const connections = useMemo(() => {
    const lines: { from: MapNode; to: MapNode; key: string }[] = [];
    const seen = new Set<string>();

    nodes.forEach((node) => {
      node.connections.forEach((conn) => {
        const key = [node.id, conn.nodeId].sort().join("-");
        if (!seen.has(key)) {
          const toNode = nodes.find((n) => n.id === conn.nodeId);
          if (toNode) {
            lines.push({ from: node, to: toNode, key });
            seen.add(key);
          }
        }
      });
    });

    return lines;
  }, [nodes]);

    // Show faint connection lines for normal Users
  if (!isAdminMode) {
    return (
      <g className="connections-layer" opacity={0.15}>
        {connections.map(({ from, to, key }) => (
          <line
            key={key}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="hsl(var(--foreground))"
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }

  if (!isAdminMode) return null;

  return (
    <g className="connections-layer">
      {connections.map(({ from, to, key }) => {
        const isHighlighted =
          selectedNodeId === from.id || selectedNodeId === to.id;

        return (
          <line
            key={key}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={
              isHighlighted
                ? "hsl(var(--primary))"
                : "hsl(var(--map-connection))"
            }
            strokeWidth={isHighlighted ? 3 : 2}
            strokeLinecap="round"
            className="connection-line"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              onConnectionClick?.(from.id, to.id);
            }}
          />
        );
      })}
    </g>
  );
}
