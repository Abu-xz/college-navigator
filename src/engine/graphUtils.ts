import { MapNode, NodeConnection } from '@/types/navigation';
import { calculateDistance } from './dijkstra';

/**
 * Create a bidirectional connection between two nodes
 */
export function connectNodes(
  nodes: MapNode[],
  nodeId1: string,
  nodeId2: string,
  customWeight?: number
): MapNode[] {
  const node1 = nodes.find(n => n.id === nodeId1);
  const node2 = nodes.find(n => n.id === nodeId2);

  if (!node1 || !node2) {
    console.warn('Cannot connect nodes: one or both nodes not found');
    return nodes;
  }

  // Calculate weight based on distance if not provided
  const weight = customWeight ?? calculateDistance(node1, node2);

  // Add connection from node1 to node2
  const existingConnection1 = node1.connections.find(c => c.nodeId === nodeId2);
  if (!existingConnection1) {
    node1.connections.push({ nodeId: nodeId2, weight });
  }

  // Add connection from node2 to node1
  const existingConnection2 = node2.connections.find(c => c.nodeId === nodeId1);
  if (!existingConnection2) {
    node2.connections.push({ nodeId: nodeId1, weight });
  }

  return [...nodes];
}

/**
 * Remove a connection between two nodes
 */
export function disconnectNodes(
  nodes: MapNode[],
  nodeId1: string,
  nodeId2: string
): MapNode[] {
  const node1 = nodes.find(n => n.id === nodeId1);
  const node2 = nodes.find(n => n.id === nodeId2);

  if (node1) {
    node1.connections = node1.connections.filter(c => c.nodeId !== nodeId2);
  }

  if (node2) {
    node2.connections = node2.connections.filter(c => c.nodeId !== nodeId1);
  }

  return [...nodes];
}

/**
 * Add a new node to the graph
 */
export function addNode(nodes: MapNode[], newNode: MapNode): MapNode[] {
  // Check if node with same ID already exists
  if (nodes.find(n => n.id === newNode.id)) {
    console.warn('Node with this ID already exists');
    return nodes;
  }

  return [...nodes, newNode];
}

/**
 * Remove a node and all its connections
 */
export function removeNode(nodes: MapNode[], nodeId: string): MapNode[] {
  // Remove all connections to this node
  const updatedNodes = nodes.map(node => ({
    ...node,
    connections: node.connections.filter(c => c.nodeId !== nodeId),
  }));

  // Remove the node itself
  return updatedNodes.filter(n => n.id !== nodeId);
}

/**
 * Update node properties
 */
export function updateNode(
  nodes: MapNode[],
  nodeId: string,
  updates: Partial<Omit<MapNode, 'id'>>
): MapNode[] {
  return nodes.map(node =>
    node.id === nodeId ? { ...node, ...updates } : node
  );
}

/**
 * Get all nodes connected to a specific node
 */
export function getConnectedNodes(nodes: MapNode[], nodeId: string): MapNode[] {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];

  return node.connections
    .map(c => nodes.find(n => n.id === c.nodeId))
    .filter((n): n is MapNode => n !== undefined);
}

/**
 * Find nodes within a certain radius
 */
export function findNodesInRadius(
  nodes: MapNode[],
  x: number,
  y: number,
  radius: number
): MapNode[] {
  return nodes.filter(node => {
    const dx = node.x - x;
    const dy = node.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}

/**
 * Get all edges (connections) in the graph
 */
export function getAllEdges(nodes: MapNode[]): { from: MapNode; to: MapNode; weight: number }[] {
  const edges: { from: MapNode; to: MapNode; weight: number }[] = [];
  const seenPairs = new Set<string>();

  nodes.forEach(node => {
    node.connections.forEach(connection => {
      const pairKey = [node.id, connection.nodeId].sort().join('-');
      if (!seenPairs.has(pairKey)) {
        const toNode = nodes.find(n => n.id === connection.nodeId);
        if (toNode) {
          edges.push({ from: node, to: toNode, weight: connection.weight });
          seenPairs.add(pairKey);
        }
      }
    });
  });

  return edges;
}

/**
 * Normalize SVG coordinates to 1000x1000 space
 */
export function normalizeCoordinates(
  svgX: number,
  svgY: number,
  svgWidth: number,
  svgHeight: number
): { x: number; y: number } {
  return {
    x: (svgX / svgWidth) * 1000,
    y: (svgY / svgHeight) * 1000,
  };
}

/**
 * Convert 1000x1000 coordinates to SVG coordinates
 */
export function denormalizeCoordinates(
  x: number,
  y: number,
  svgWidth: number,
  svgHeight: number
): { svgX: number; svgY: number } {
  return {
    svgX: (x / 1000) * svgWidth,
    svgY: (y / 1000) * svgHeight,
  };
}

/**
 * Generate a unique node ID
 */
export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate graph connectivity
 * Returns true if all nodes are reachable from any node
 */
export function isGraphConnected(nodes: MapNode[]): boolean {
  if (nodes.length === 0) return true;
  if (nodes.length === 1) return true;

  const visited = new Set<string>();
  const queue: string[] = [nodes[0].id];
  visited.add(nodes[0].id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = nodes.find(n => n.id === currentId);
    
    if (currentNode) {
      currentNode.connections.forEach(conn => {
        if (!visited.has(conn.nodeId)) {
          visited.add(conn.nodeId);
          queue.push(conn.nodeId);
        }
      });
    }
  }

  return visited.size === nodes.length;
}
