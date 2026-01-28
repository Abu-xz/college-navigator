import React from 'react';
import { Building } from '@/types/navigation';

interface BuildingLayerProps {
  buildings: Building[];
  onBuildingClick?: (building: Building) => void;
  hoveredBuilding?: string | null;
  onBuildingHover?: (buildingId: string | null) => void;
}

export function BuildingLayer({
  buildings,
  onBuildingClick,
  hoveredBuilding,
  onBuildingHover,
}: BuildingLayerProps) {
  return (
    <g className="buildings-layer">
      {buildings.map((building) => {
        const isHovered = hoveredBuilding === building.id;
        
        return (
          <g key={building.id}>
            {/* Building shadow */}
            <rect
              x={building.bounds.x + 4}
              y={building.bounds.y + 4}
              width={building.bounds.width}
              height={building.bounds.height}
              rx={8}
              fill="hsl(var(--foreground) / 0.1)"
            />
            
            {/* Building body */}
            <rect
              x={building.bounds.x}
              y={building.bounds.y}
              width={building.bounds.width}
              height={building.bounds.height}
              rx={8}
              fill={isHovered ? 'hsl(var(--map-building-hover))' : 'hsl(var(--map-building))'}
              stroke={building.color}
              strokeWidth={2}
              className="building-interactive"
              onClick={() => onBuildingClick?.(building)}
              onMouseEnter={() => onBuildingHover?.(building.id)}
              onMouseLeave={() => onBuildingHover?.(null)}
              style={{ cursor: 'pointer' }}
            />
            
            {/* Building label */}
            <text
              x={building.bounds.x + building.bounds.width / 2}
              y={building.bounds.y + building.bounds.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="hsl(var(--foreground))"
              fontSize={8}
              fontWeight={600}
              className="pointer-events-none select-none"
            >
              {building.shortName}
            </text>
            
            {/* Full name on hover */}
            {isHovered && (
              <text
                x={building.bounds.x + building.bounds.width / 2}
                y={building.bounds.y + building.bounds.height + 16}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize={11}
                className="pointer-events-none select-none animate-fade-in"
              >
                {building.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
