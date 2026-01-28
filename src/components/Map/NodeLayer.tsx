import React from 'react';
import { MapNode } from '@/types/navigation';

interface NodeLayerProps {
  nodes: MapNode[];
  selectedNodeId?: string | null;
  startNodeId?: string | null;
  endNodeId?: string | null;
  isAdminMode?: boolean;
  isConnecting?: boolean;
  connectionStartId?: string | null;
  onNodeClick?: (node: MapNode) => void;
  onNodeHover?: (node: MapNode | null) => void;
  zoomLevel?: number;
}

const NODE_COLORS: Record<MapNode['type'], string> = {
  ROOM: 'hsl(var(--primary))',
  WAYPOINT: 'hsl(var(--muted-foreground))',
  ENTRANCE: 'hsl(var(--success))',
  STAIRS: 'hsl(var(--warning))',
  ELEVATOR: 'hsl(var(--accent))',
};

const NODE_SIZES: Record<MapNode['type'], number> = {
  ROOM: 8,
  WAYPOINT: 5,
  ENTRANCE: 10,
  STAIRS: 8,
  ELEVATOR: 8,
};

export function NodeLayer({
  nodes,
  selectedNodeId,
  startNodeId,
  endNodeId,
  isAdminMode = false,
  isConnecting = false,
  connectionStartId,
  onNodeClick,
  onNodeHover,
  zoomLevel = 1,
}: NodeLayerProps) {
  // Only show detailed nodes in admin mode or at high zoom
  const showLabels = isAdminMode || zoomLevel > 0.8;
  
  return (
    <g className="nodes-layer">
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const isStart = startNodeId === node.id;
        const isEnd = endNodeId === node.id;
        const isConnectionStart = connectionStartId === node.id;
        const baseSize = NODE_SIZES[node.type];
        const size = isSelected || isStart || isEnd ? baseSize * 1.5 : baseSize;
        
        // Skip waypoints in non-admin mode at low zoom
        if (!isAdminMode && node.type === 'WAYPOINT' && zoomLevel < 0.6) {
          return null;
        }
        
        let fillColor = NODE_COLORS[node.type];
        if (isStart) fillColor = 'hsl(var(--map-marker-start))';
        if (isEnd) fillColor = 'hsl(var(--map-marker-end))';
        if (isConnectionStart) fillColor = 'hsl(var(--accent))';
        
        return (
          <g key={node.id}>
            {/* Pulse ring for start/end markers */}
            {(isStart || isEnd) && (
              <circle
                cx={node.x}
                cy={node.y}
                r={size + 6}
                fill="none"
                stroke={fillColor}
                strokeWidth={2}
                opacity={0.5}
              />
            )}
            
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={size}
              fill={fillColor}
              stroke={isSelected ? 'hsl(var(--foreground))' : 'hsl(var(--background))'}
              strokeWidth={isSelected ? 3 : 2}
              className="map-node"
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick?.(node);
              }}
              onMouseEnter={() => onNodeHover?.(node)}
              onMouseLeave={() => onNodeHover?.(null)}
              style={{
                cursor: isConnecting ? 'crosshair' : 'pointer',
                filter: isSelected ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : undefined,
              }}
            />
            
            {/* Node label */}
            {showLabels && node.type !== 'WAYPOINT' && (
              <text
                x={node.x}
                y={node.y - size - 6}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize={10}
                fontWeight={500}
                className="pointer-events-none select-none"
              >
                {node.name.length > 20 ? node.name.slice(0, 17) + '...' : node.name}
              </text>
            )}
            
            {/* Admin mode: show all labels */}
            {isAdminMode && node.type === 'WAYPOINT' && (
              <text
                x={node.x}
                y={node.y - size - 4}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={8}
                className="pointer-events-none select-none"
              >
                WP
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
