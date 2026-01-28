import { useCallback } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { MapNode, NodeType } from '@/types/navigation';
import { normalizeCoordinates } from '@/engine/graphUtils';

export function useAdminMode() {
  const {
    isAdminMode,
    selectedNode,
    isConnecting,
    connectionStart,
    nodes,
    buildings,
    currentFloor,
    toggleAdminMode,
    selectNode,
    addNewNode,
    deleteNode,
    startConnection,
    completeConnection,
    cancelConnection,
    removeConnection,
    updateNodePosition,
    exportData,
    importData,
  } = useNavigationStore();

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
    [isAdminMode, isConnecting, selectedNode, cancelConnection, selectNode]
  );

  // Create a new node at position
  const createNodeAtPosition = useCallback(
    (
      x: number,
      y: number,
      type: NodeType = 'WAYPOINT',
      name?: string,
      buildingId?: string
    ) => {
      const defaultName = `${type} at (${Math.round(x)}, ${Math.round(y)})`;
      addNewNode(x, y, type, name || defaultName, buildingId || '');
    },
    [addNewNode]
  );

  // Get node connections as line segments
  const getConnectionLines = useCallback(() => {
    const lines: { from: MapNode; to: MapNode; key: string }[] = [];
    const seen = new Set<string>();

    nodes.forEach((node) => {
      node.connections.forEach((conn) => {
        const key = [node.id, conn.nodeId].sort().join('-');
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
    [nodes]
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

    // Helpers
    getConnectionLines,
    areNodesConnected,
    availableBuildings,
  };
}
