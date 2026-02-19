import React from "react";
import { Clock, Route, MapPin, ArrowRight, Footprints } from "lucide-react";
import { PathResult, MapNode } from "@/types/navigation";
import { formatDistance, formatTime } from "@/engine/dijkstra";
import { cn } from "@/lib/utils";

interface InfoPanelProps {
  path: PathResult | null;
  startNode: MapNode | null;
  endNode: MapNode | null;
  isCalculating?: boolean;
}

export function InfoPanel({
  path,
  startNode,
  endNode,
  isCalculating,
}: InfoPanelProps) {
  if (!startNode && !endNode) {
    return (
      <div className="map-panel p-4 animate-fade-in">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <p className="text-sm">
            Select a starting point and destination to find the route
          </p>
        </div>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="map-panel p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            Finding the best route...
          </p>
        </div>
      </div>
    );
  }

  if (startNode && endNode && !path) {
    return (
      <div className="map-panel p-4 animate-fade-in border-destructive/50">
        <div className="flex items-center gap-3 text-destructive">
          <Route className="h-5 w-5" />
          <p className="text-sm font-medium">
            No route found between these locations
          </p>
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
            {startNode ? "Now select your destination" : "Select a destination"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-panel p-4 animate-slide-up w-full">
      {/* Route summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full bg-success flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {startNode?.name}
          </span>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full bg-destructive flex-shrink-0" />
          <span className="text-sm font-medium truncate">{endNode?.name}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <span className="text-xs uppercase tracking-wide">
              Walking Time
            </span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {formatTime(path.estimatedTime)}
          </p>
        </div>
      </div>

      {/* Route steps — Vertical */}
      {path.nodes.length > 1 && (
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
            Route Steps ({path.nodes.length})
          </p>

          <div className="flex flex-col gap-3">
            {path.nodes.map((node, index) => (
              <div key={node.id} className="flex items-start gap-3">
                {/* Dot + line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      index === 0 && "bg-success",
                      index === path.nodes.length - 1 && "bg-destructive",
                      index > 0 &&
                        index < path.nodes.length - 1 &&
                        "bg-muted-foreground",
                    )}
                  />
                  {index < path.nodes.length - 1 && (
                    <div className="w-px h-6 bg-border mt-1" />
                  )}
                </div>

                {/* Label */}
                <div className="text-sm leading-tight">
                  <span
                    className={cn(
                      "font-medium",
                      index === 0 && "text-success",
                      index === path.nodes.length - 1 && "text-destructive",
                      index > 0 &&
                        index < path.nodes.length - 1 &&
                        "text-muted-foreground",
                    )}
                  >
                    {node.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
