import React from 'react';
import { Clock, Route, MapPin, ArrowRight, Footprints } from 'lucide-react';
import { PathResult, MapNode } from '@/types/navigation';
import { formatDistance, formatTime } from '@/engine/dijkstra';
import { cn } from '@/lib/utils';

interface InfoPanelProps {
  path: PathResult | null;
  startNode: MapNode | null;
  endNode: MapNode | null;
  isCalculating?: boolean;
}

export function InfoPanel({ path, startNode, endNode, isCalculating }: InfoPanelProps) {
  if (!startNode && !endNode) {
    return (
      <div className="map-panel p-4 animate-fade-in">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <p className="text-sm">Select a starting point and destination to find the route</p>
        </div>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="map-panel p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Finding the best route...</p>
        </div>
      </div>
    );
  }

  if (startNode && endNode && !path) {
    return (
      <div className="map-panel p-4 animate-fade-in border-destructive/50">
        <div className="flex items-center gap-3 text-destructive">
          <Route className="h-5 w-5" />
          <p className="text-sm font-medium">No route found between these locations</p>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="map-panel p-4 animate-fade-in">
        <div className="flex items-center gap-3 text-muted-foreground">
          <ArrowRight className="h-5 w-5" />
          <p className="text-sm">
            {startNode ? 'Now select your destination' : 'Select a destination'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-panel p-4 animate-slide-up">
      {/* Route summary */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm font-medium truncate max-w-[120px]">
            {startNode?.name}
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-sm font-medium truncate max-w-[120px]">
            {endNode?.name}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Footprints className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Distance</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {formatDistance(path.totalDistanceMeters)}
          </p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Walking Time</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {formatTime(path.estimatedTime)}
          </p>
        </div>
      </div>

      {/* Route steps */}
      {path.nodes.length > 2 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Route ({path.nodes.length} waypoints)
          </p>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
            {path.nodes.slice(0, 6).map((node, index) => (
              <React.Fragment key={node.id}>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full whitespace-nowrap',
                    index === 0 && 'bg-success/20 text-success',
                    index === path.nodes.length - 1 && 'bg-destructive/20 text-destructive',
                    index > 0 && index < path.nodes.length - 1 && 'bg-muted text-muted-foreground'
                  )}
                >
                  {node.name.length > 15 ? node.name.slice(0, 12) + '...' : node.name}
                </span>
                {index < Math.min(path.nodes.length - 1, 5) && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
            {path.nodes.length > 6 && (
              <span className="text-xs text-muted-foreground px-2">
                +{path.nodes.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
