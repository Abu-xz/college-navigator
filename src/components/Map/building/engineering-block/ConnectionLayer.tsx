import React, { useMemo } from "react";
import { MapNode } from "@/types/navigation";
import { useBlockNavigation } from "@/hooks/useBlockNavigation";

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
  const { currentFloor } = useBlockNavigation();

  const floorNodes = useMemo(() => {
    return nodes.filter((node) => node.floor === currentFloor);
  }, [nodes, currentFloor]);

  const connections = useMemo(() => {
    const lines: { from: MapNode; to: MapNode; key: string }[] = [];
    const seen = new Set<string>();

    floorNodes.forEach((node) => {
      node.connections.forEach((conn) => {
        const toNode = floorNodes.find((n) => n.id === conn.nodeId);

        if (!toNode) return; // 🚨 skip cross-floor connection

        const key = [node.id, conn.nodeId].sort().join("-");

        if (!seen.has(key)) {
          lines.push({ from: node, to: toNode, key });
          seen.add(key);
        }
      });
    });

    return lines;
  }, [floorNodes]);

  if (!floorNodes.length) return null;

  if (!isAdminMode) {
    // In normal mode, show faint connection lines
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
