import { MapNode } from "@/types/navigation";

export const findNearestNode = (
  x: number,
  y: number,
  nodes: MapNode[]
): MapNode | null => {

  let minDist = Infinity;
  let nearest: MapNode | null = null;

  for (const node of nodes) {
    const dist = Math.sqrt(
      Math.pow(node.x - x, 2) +
      Math.pow(node.y - y, 2)
    );

    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }

  return nearest;
};