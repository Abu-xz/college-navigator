import React, { useMemo } from "react";
import { PathResult } from "@/types/navigation";
import { useBlockNavigation } from "@/hooks/useBlockNavigation";

interface PathOverlayProps {
  path: PathResult | null;
  animate?: boolean;
}

export function PathOverlay({ path, animate = true }: PathOverlayProps) {
  const { currentFloor } = useBlockNavigation();

  // Generate SVG path data from nodes
  const pathData = useMemo(() => {
    if (!path || path.nodes.length < 2) return null;

    // 1. Take only nodes of this floor
    const floorNodes = path.nodes.filter((node) => node.floor === currentFloor);

    // // 2. Need at least 2 points to draw a path
    if (floorNodes.length < 2) return null;

    // 3. Build SVG path
    const svg = `M ${floorNodes.map((n) => `${n.x},${n.y}`).join(" L ")}`;
    console.log(svg);

    return svg;
  }, [path, currentFloor]);

  // Calculate path length for animation
  const pathLength = useMemo(() => {
    if (!path || path.nodes.length < 2) return 0;

    let length = 0;
    for (let i = 1; i < path.nodes.length; i++) {
      const prev = path.nodes[i - 1];
      const curr = path.nodes[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }, [path]);

  if (!pathData) return null;

  return (
    <g className="path-overlay">
      {/* Glow effect */}
      <path
        d={pathData}
        fill="none"
        stroke="hsl(var(--map-path-glow))"
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.3}
        style={{
          filter: "blur(4px)",
        }}
      />

      {/* Main path */}
      <path
        d={pathData}
        fill="none"
        stroke="hsl(var(--map-path))"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={animate ? pathLength : "none"}
        strokeDashoffset={animate ? pathLength : 0}
        style={{
          animation: animate ? `draw-path 1.5s ease-out forwards` : "none",
        }}
      />

      {/* Direction arrows along the path */}
      {path && (
        <g className="direction-arrows">
          {(() => {
            // 1. Filter nodes for this floor
            const floorNodes = path.nodes.filter(
              (n) => n.floor === currentFloor,
            );

            if (floorNodes.length < 2) return null;

            // 2. Build arrows from filtered nodes
            return floorNodes.slice(0, -1).map((node, index) => {
              if (index % 2 !== 0) return null;

              const nextNode = floorNodes[index + 1];

              const midX = (node.x + nextNode.x) / 2;
              const midY = (node.y + nextNode.y) / 2;

              const angle = Math.atan2(
                nextNode.y - node.y,
                nextNode.x - node.x,
              );
              const rotation = (angle * 180) / Math.PI;

              return (
                <g
                  key={`arrow-${currentFloor}-${index}`}
                  transform={`translate(${midX}, ${midY}) rotate(${rotation})`}
                >
                  <polygon
                    points="0,-4 8,0 0,4"
                    fill="hsl(var(--map-path))"
                    opacity={0.8}
                  />
                </g>
              );
            });
          })()}
        </g>
      )}

      <style>{`
        @keyframes draw-path {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </g>
  );
}
