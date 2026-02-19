// Node types for different locations on the map
export type NodeType = "ROOM" | "WAYPOINT" | "ENTRANCE" | "STAIRS" | "ELEVATOR";

// building types for different locations
export type BuildingId = "engineering" | "";

// A node represents a navigable point on the map
export interface MapNode {
  id: string;
  type: NodeType;
  name: string;
  floor: number;
  buildingId: string;
  x: number; // 0-1000 scale
  y: number; // 0-1000 scale
  connections: NodeConnection[];
}

// Connection between two nodes with a weight (distance)
export interface NodeConnection {
  nodeId: string;
  weight: number; // Distance in units (1 unit = 0.5 meters)
}

// Building definition
export interface Building {
  id: string;
  name: string;
  shortName: string;
  floors: number[];
  color: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Room is a navigable destination
export interface Room {
  id: string;
  name: string;
  buildingId: string;
  floor: number;
  nodeId: string; // Foreign key to MapNode
  category?: string;
}

// Path result from pathfinding
export interface PathResult {
  nodes: MapNode[];
  totalDistance: number; // in units
  totalDistanceMeters: number; // in meters
  estimatedTime: number; // in seconds
  estimatedTimeMinutes: number; // in minutes
}

// Map viewport state
export interface ViewportState {
  scale: number;
  positionX: number;
  positionY: number;
}

// Navigation state
export interface NavigationState {
  startNode: MapNode | null;
  endNode: MapNode | null;
  currentPath: PathResult | null;
  isCalculating: boolean;
}

// Admin mode state
export interface AdminState {
  isEnabled: boolean;
  selectedNode: MapNode | null;
  isConnecting: boolean;
  connectionStart: MapNode | null;
}
