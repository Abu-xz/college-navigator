import { create } from "zustand";
import {
  MapNode,
  PathResult,
  Building,
  Room,
  NodeType,
} from "@/types/navigation";
import {
  initialNodes,
  initialConnections,
  buildings,
  rooms,
} from "@/data/campusData";
import { findShortestPath } from "@/engine/dijkstra";
import {
  connectNodes,
  addNode,
  removeNode,
  disconnectNodes,
  generateNodeId,
} from "@/engine/graphUtils";
import { buildingsService } from "@/services/buildings.service";
import { mapNodesService } from "@/services/nodes.service";
import { toast } from "sonner";

interface NavigationStore {
  // Map data
  nodes: MapNode[];
  buildings: Building[];
  rooms: Room[];

  // Navigation state
  startNode: MapNode | null;
  endNode: MapNode | null;
  currentPath: PathResult | null;
  isCalculating: boolean;

  // Admin state
  isAdminMode: boolean;
  selectedNode: MapNode | null;
  isConnecting: boolean;
  connectionStart: MapNode | null;

  // New Node
  newNodeType: NodeType;
  setNewNodeType: (type: NodeType) => void;

  // Node Edit
  editingMode: MapNode | null;
  setEditingMode: (node: MapNode) => void;

  // Viewport
  currentFloor: number;
  searchQuery: string;

  // Fetch Map Data
  setBuildings: (data: Building[]) => void;
  fetchBuildings: () => Promise<void>;

  // Fetch Nodes Data
  setNodes: (data: MapNode[]) => void;
  fetchNodes: () => Promise<void>;

  // Actions
  setStartNode: (node: MapNode | null) => void;
  setEndNode: (node: MapNode | null) => void;
  calculatePath: () => void;
  clearPath: () => void;

  // Admin actions
  toggleAdminMode: () => void;
  selectNode: (node: MapNode | null) => void;
  addNewNode: (
    id: string,
    x: number,
    y: number,
    type: MapNode["type"],
    name: string,
    buildingId: string,
  ) => void;
  deleteNode: (nodeId: string) => void;
  startConnection: (node: MapNode) => void;
  completeConnection: (targetNode: MapNode) => void;
  cancelConnection: () => void;
  removeConnection: (nodeId1: string, nodeId2: string) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;

  // UI actions
  setCurrentFloor: (floor: number) => void;
  setSearchQuery: (query: string) => void;

  // Data actions
  exportData: () => string;
  importData: (json: string) => void;
}

// Initialize nodes with connections
// function initializeNodesWithConnections(): MapNode[] {
//   let nodes = [...initialNodes];

//   initialConnections.forEach(([id1, id2]) => {
//     nodes = connectNodes(nodes, id1, id2);
//   });

//   console.log(nodes);

//   return nodes;
// }

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  // Initial state
  nodes: [],
  buildings: [],
  rooms,

  startNode: null,
  endNode: null,
  currentPath: null,
  isCalculating: false,

  isAdminMode: false,
  selectedNode: null,
  isConnecting: false,
  connectionStart: null,

  currentFloor: 0,
  searchQuery: "",
  newNodeType: "WAYPOINT",

  // New Node type
  setNewNodeType: (type) => {
    set({ newNodeType: type });
  },

  // Edit Node
  editingMode: null,
  setEditingMode: (node: MapNode) => {
    set({
      editingMode: node
    })
  },

  // Fetch Map Building data
  setBuildings: (data) => set({ buildings: data }),
  fetchBuildings: async () => {
    try {
      const response = await buildingsService.getBuildings();
      const data = response.data;
      set({
        buildings: data,
      });
    } catch (error) {
      console.error("Failed to fetch buildings", error.response.data);
    }
  },
  // Fetch Map Nodes data
  setNodes: (data) => set({ nodes: data }),
  fetchNodes: async () => {
    try {
      const response = await mapNodesService.getMapNodes();
      const data = response.data;
      console.log("fetched updated nodes")
      set({
        nodes: data,
      });
    } catch (err) {
      console.error("Failed to fetch buildings", err);
    }
  },

  // Navigation actions
  setStartNode: (node) => {
    set({ startNode: node });
    get().calculatePath();
  },

  setEndNode: (node) => {
    set({ endNode: node });
    get().calculatePath();
  },

  calculatePath: () => {
    const { startNode, endNode, nodes } = get();

    if (!startNode || !endNode) {
      set({ currentPath: null });
      return;
    }

    set({ isCalculating: true });

    // Small delay for UX
    setTimeout(() => {
      const path = findShortestPath(nodes, startNode.id, endNode.id);
      set({ currentPath: path, isCalculating: false });
    }, 100);
  },

  clearPath: () => {
    set({ startNode: null, endNode: null, currentPath: null });
  },

  // Admin actions
  toggleAdminMode: () => {
    set((state) => ({
      isAdminMode: !state.isAdminMode,
      selectedNode: null,
      isConnecting: false,
      connectionStart: null,
    }));
  },

  selectNode: (node) => {
    const { isConnecting, connectionStart } = get();

    if (
      isConnecting &&
      connectionStart &&
      node &&
      node.id !== connectionStart.id
    ) {
      get().completeConnection(node);
    } else {
      set({ selectedNode: node });
    }
  },

  addNewNode: (id, x, y, type, name, buildingId) => {
    const newNode: MapNode = {
      id,
      type,
      name,
      floor: get().currentFloor,
      buildingId,
      x,
      y,
      connections: [],
    };

    set((state) => ({
      nodes: addNode(state.nodes, newNode),
      selectedNode: newNode,
    }));
  },

  deleteNode: async (nodeId) => {
    try {
      const response = await mapNodesService.deleteNode(nodeId);
      if (response.success) {
        set((state) => ({
          nodes: removeNode(state.nodes, nodeId),
          selectedNode:
            state.selectedNode?.id === nodeId ? null : state.selectedNode,
        }));
      }
    } catch (error) {
      toast("Unable to delete Node. Please Try again later");
      console.log("Delete Node error: ", error.response.data);
    }
  },

  startConnection: (node) => {
    set({ isConnecting: true, connectionStart: node });
  },

  completeConnection: async (targetNode) => {
    const { connectionStart, nodes } = get();

    if (!connectionStart) return;

    const updatedNodes = await connectNodes(
      nodes,
      connectionStart.id,
      targetNode.id,
    );
    set({
      nodes: updatedNodes,
      isConnecting: false,
      connectionStart: null,
    });
  },

  cancelConnection: () => {
    set({ isConnecting: false, connectionStart: null });
  },

  removeConnection: (nodeId1, nodeId2) => {
    set((state) => ({
      nodes: disconnectNodes(state.nodes, nodeId1, nodeId2),
    }));
  },

  updateNodePosition: (nodeId, x, y) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node,
      ),
    }));
  },

  // UI actions
  setCurrentFloor: (floor) => {
    set({ currentFloor: floor });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Data actions
  exportData: () => {
    const { nodes, buildings, rooms } = get();
    return JSON.stringify({ nodes, buildings, rooms }, null, 2);
  },

  importData: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes) {
        set({
          nodes: data.nodes,
          buildings: data.buildings || buildings,
          rooms: data.rooms || rooms,
        });
      }
    } catch (e) {
      console.error("Failed to import data:", e);
    }
  },
}));
