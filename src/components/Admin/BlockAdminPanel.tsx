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
  User,
  Edit,
} from "lucide-react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useNavigationStore } from "@/store/useNavigationStore";
import { Button } from "@/components/ui/button";
import { NodeType } from "@/types/navigation";
import { cn } from "@/lib/utils";
import { useBlockAdminMode } from "@/hooks/useBlockAdminMode";

const NODE_TYPES: { type: NodeType; label: string; color: string }[] = [
  { type: "ROOM", label: "Room", color: "bg-primary" },
  { type: "WAYPOINT", label: "Waypoint", color: "bg-muted-foreground" },
  { type: "ENTRANCE", label: "Entrance", color: "bg-success" },
  { type: "STAIRS", label: "Stairs", color: "bg-warning" },
  { type: "ELEVATOR", label: "Elevator", color: "bg-accent" },
];

export function BlockAdminPanel() {
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
    newNodeType,
    setNewNodeType,
    setEditingMode,
    exportData,
  } = useBlockAdminMode();

  if (!isAdminMode) return null;

  return (
    <>
      {/* Admin toolbar */}
      <div className="w-72 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-purple-600 p-4 w-full rounded">
            <User color="white" className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-xl text-white">Admin Panel</h3>
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
                onClick={() => {
                  setNewNodeType(type);
                }}
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
                variant="default"
                size="sm"
                onClick={() => {
                  console.log('edit modal click')
                  setEditingMode(selectedNode);
                }}
                className="flex-1"
              >
                <Edit color="white" size={13} />
                Edit
              </Button>
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
        {/* <div className="flex gap-2">
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
        </div> */}
      </div>
    </>
  );
}
