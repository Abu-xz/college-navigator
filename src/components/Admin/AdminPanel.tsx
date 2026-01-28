import React, { useState } from "react";
import {
  Settings,
  Plus,
  Trash2,
  Link2,
  Unlink,
  Download,
  Upload,
  Move,
  X,
  Check,
} from "lucide-react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useNavigationStore } from "@/store/useNavigationStore";
import { Button } from "@/components/ui/button";
import { NodeType } from "@/types/navigation";
import { cn } from "@/lib/utils";

const NODE_TYPES: { type: NodeType; label: string; color: string }[] = [
  { type: "ROOM", label: "Room", color: "bg-primary" },
  { type: "WAYPOINT", label: "Waypoint", color: "bg-muted-foreground" },
  { type: "ENTRANCE", label: "Entrance", color: "bg-success" },
  { type: "STAIRS", label: "Stairs", color: "bg-warning" },
  { type: "ELEVATOR", label: "Elevator", color: "bg-accent" },
];

export function AdminPanel() {
  const [newNodeType, setNewNodeType] = useState<NodeType>("WAYPOINT");
  const [showExport, setShowExport] = useState(false);

  const {
    isAdminMode,
    selectedNode,
    isConnecting,
    connectionStart,
    toggleAdminMode,
    selectNode,
    deleteNode,
    startConnection,
    cancelConnection,
    exportData,
  } = useAdminMode();

  const { setCurrentFloor, currentFloor } = useNavigationStore();

  if (!isAdminMode) return null;

  return (
    <>
      {/* Admin toolbar */}
      <div className="absolute top-0 left-0 z-20 map-panel p-4 w-72 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Admin Mode</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleAdminMode}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Floor selector */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Floor
          </p>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((floor) => (
              <button
                key={floor}
                onClick={() => setCurrentFloor(floor)}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-md transition-colors",
                  currentFloor === floor
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {floor === 0 ? "GF" : `F${floor}`}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            {isConnecting
              ? "🔗 Click another node to connect, or click empty space to cancel"
              : selectedNode
                ? "✏️ Selected node. Use actions below to edit."
                : "👆 Double-click on map to add a node. Click a node to select it."}
          </p>
        </div>

        {/* Node type selector (for new nodes) */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            New Node Type
          </p>
          <div className="flex flex-wrap gap-1">
            {NODE_TYPES.map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => setNewNodeType(type)}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                  newNodeType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", color)} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected node actions */}
        {selectedNode && (
          <div className="mb-4 p-3 bg-card border border-border rounded-lg">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Selected: {selectedNode.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {isConnecting ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelConnection}
                  className="flex-1"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startConnection(selectedNode)}
                  className="flex-1"
                >
                  <Link2 className="h-3 w-3 mr-1" />
                  Connect
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteNode(selectedNode.id)}
                className="flex-1"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>
                Position: ({Math.round(selectedNode.x)},{" "}
                {Math.round(selectedNode.y)})
              </p>
              <p>Connections: {selectedNode.connections.length}</p>
            </div>
          </div>
        )}

        {/* Export/Import */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = exportData();
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "campus-map-data.json";
              a.click();
            }}
            className="flex-1"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Connection indicator */}
      {isConnecting && connectionStart && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 map-panel px-4 py-2 animate-fade-in border-accent">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-accent" />
            <span className="text-sm">
              Connecting from <strong>{connectionStart.name}</strong>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
