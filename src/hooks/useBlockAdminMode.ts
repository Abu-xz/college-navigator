import { useCallback } from "react";
import { useNavigationStore } from "@/store/useNavigationStore";
import { MapNode, NodeType } from "@/types/navigation";
import { normalizeCoordinates } from "@/engine/graphUtils";
import { useBlockNavigationStore } from "@/store/useBlockNavigationStore";
import { mapNodesService } from "@/services/nodes.service";
import { toast } from "sonner";

export function useBlockAdminMode() {
  const {
    isAdminMode,
    selectedNode,
    isConnecting,
    connectionStart,
    nodes,
    buildings,
    currentFloor,
    setCurrentFloor,
    toggleAdminMode,
    selectNode,
    addNewNode,
    deleteNode,
    startConnection,
    completeConnection,
    cancelConnection,
    removeConnection,
    updateNodePosition,
    newNodeType,
    setNewNodeType,
    editingMode,
    setEditingMode,
    exportData,
    importData,
  } = useBlockNavigationStore();

  // Handle map click in admin mode
  const handleMapClick = useCallback(
    (svgX: number, svgY: number, svgWidth: number, svgHeight: number) => {
      if (!isAdminMode) return;

      const { x, y } = normalizeCoordinates(svgX, svgY, svgWidth, svgHeight);

      // If connecting, clicking empty space cancels
      if (isConnecting) {
        cancelConnection();
        return;
      }

      // Deselect if clicking empty space
      if (selectedNode) {
        selectNode(null);
      }
    },
    [isAdminMode, isConnecting, selectedNode, cancelConnection, selectNode],
  );

  // Create a new node at position
  const createNodeAtPosition = useCallback(
    async (
      x: number,
      y: number,
      type: NodeType = "WAYPOINT",
      name?: string,
      buildingId?: string,
    ) => {
      const defaultName = `${type} at (${Math.round(x)}, ${Math.round(y)})`;

      const newNode = {
        x: Math.round(x),
        y: Math.round(y),
        type: type,
        floor: currentFloor,
        name: name || defaultName,
        buildingId: buildingId || "",
        connections: [],
      };
      try {
        console.log("adding new node and send to backend");
        const res = await mapNodesService.createNode(newNode);
        const data = res.data;
        if (res.success) {
          addNewNode(
            data.id,
            Math.round(x),
            Math.round(y),
            type,
            name || defaultName,
            buildingId || "",
          );
        }
      } catch (error) {
        toast.error("Unable to create new node, Please try again");
        console.log("Error: [block admin mode hook]", error);
      }
    },
    [addNewNode, currentFloor],
  );

  // Get node connections as line segments
  const getConnectionLines = useCallback(() => {
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

  // Check if two nodes are connected
  const areNodesConnected = useCallback(
    (nodeId1: string, nodeId2: string) => {
      const node1 = nodes.find((n) => n.id === nodeId1);
      return node1?.connections.some((c) => c.nodeId === nodeId2) ?? false;
    },
    [nodes],
  );

  // Get available buildings for dropdown
  const availableBuildings = buildings.map((b) => ({
    id: b.id,
    name: b.name,
    shortName: b.shortName,
  }));

  return {
    // State
    isAdminMode,
    selectedNode,
    isConnecting,
    connectionStart,
    nodes,
    currentFloor,

    // Actions
    toggleAdminMode,
    selectNode,
    deleteNode,
    startConnection,
    completeConnection,
    cancelConnection,
    removeConnection,
    updateNodePosition,
    handleMapClick,
    createNodeAtPosition,
    exportData,
    importData,

    // New Node
    newNodeType,
    setNewNodeType,

    // Edit Node
    editingMode,
    setEditingMode,

    // Helpers
    getConnectionLines,
    areNodesConnected,
    availableBuildings,
  };
}
