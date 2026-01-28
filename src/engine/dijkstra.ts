import { MapNode, PathResult } from '@/types/navigation';

// Priority queue implementation for Dijkstra's algorithm
class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number): void {
    const item = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (item.priority < this.items[i].priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(item);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Constants for distance/time calculations
const UNIT_TO_METERS = 0.5; // 1 unit = 0.5 meters
const WALKING_SPEED_MPS = 1.4; // 1.4 meters per second

/**
 * Dijkstra's Shortest Path Algorithm
 * Finds the shortest path between two nodes in a graph
 */
export function findShortestPath(
  nodes: MapNode[],
  startId: string,
  endId: string
): PathResult | null {
  // Create a map for quick node lookup
  const nodeMap = new Map<string, MapNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));

  const startNode = nodeMap.get(startId);
  const endNode = nodeMap.get(endId);

  if (!startNode || !endNode) {
    return null;
  }

  // If start and end are the same
  if (startId === endId) {
    return {
      nodes: [startNode],
      totalDistance: 0,
      totalDistanceMeters: 0,
      estimatedTime: 0,
      estimatedTimeMinutes: 0,
    };
  }

  // Initialize distances and previous nodes
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const pq = new PriorityQueue<string>();

  // Set all distances to infinity initially
  nodes.forEach(node => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  });

  // Distance to start is 0
  distances.set(startId, 0);
  pq.enqueue(startId, 0);

  while (!pq.isEmpty()) {
    const currentId = pq.dequeue()!;
    const currentNode = nodeMap.get(currentId);

    if (!currentNode) continue;

    // If we've reached the destination
    if (currentId === endId) {
      break;
    }

    const currentDistance = distances.get(currentId)!;

    // Skip if we've already found a better path
    if (currentDistance === Infinity) continue;

    // Check all neighbors
    for (const connection of currentNode.connections) {
      const neighbor = nodeMap.get(connection.nodeId);
      if (!neighbor) continue;

      const newDistance = currentDistance + connection.weight;

      if (newDistance < (distances.get(connection.nodeId) ?? Infinity)) {
        distances.set(connection.nodeId, newDistance);
        previous.set(connection.nodeId, currentId);
        pq.enqueue(connection.nodeId, newDistance);
      }
    }
  }

  // Reconstruct the path
  const path: MapNode[] = [];
  let current: string | null = endId;

  while (current !== null) {
    const node = nodeMap.get(current);
    if (node) {
      path.unshift(node);
    }
    current = previous.get(current) ?? null;
  }

  // If no path found (path doesn't start from startNode)
  if (path.length === 0 || path[0].id !== startId) {
    return null;
  }

  const totalDistance = distances.get(endId) ?? 0;
  const totalDistanceMeters = totalDistance * UNIT_TO_METERS;
  const estimatedTime = totalDistanceMeters / WALKING_SPEED_MPS;
  const estimatedTimeMinutes = estimatedTime / 60;

  return {
    nodes: path,
    totalDistance,
    totalDistanceMeters,
    estimatedTimeMinutes,
    estimatedTime,
  };
}

/**
 * Calculate the Euclidean distance between two nodes
 */
export function calculateDistance(node1: MapNode, node2: MapNode): number {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance in meters
 */
export function distanceToMeters(units: number): number {
  return units * UNIT_TO_METERS;
}

/**
 * Calculate walking time in seconds
 */
export function distanceToTime(meters: number): number {
  return meters / WALKING_SPEED_MPS;
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remainingSeconds} sec`;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}
