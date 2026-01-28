import { useCallback, useMemo } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { MapNode, Room } from '@/types/navigation';

export function useNavigation() {
  const {
    nodes,
    buildings,
    rooms,
    startNode,
    endNode,
    currentPath,
    isCalculating,
    setStartNode,
    setEndNode,
    clearPath,
    searchQuery,
    setSearchQuery,
    currentFloor,
  } = useNavigationStore();

  // Get searchable locations (rooms and entrances)
  const searchableLocations = useMemo(() => {
    const locations: { node: MapNode; displayName: string; category: string }[] = [];
    
    // Add rooms
    rooms.forEach((room) => {
      const node = nodes.find((n) => n.id === room.nodeId);
      if (node) {
        const building = buildings.find((b) => b.id === room.buildingId);
        locations.push({
          node,
          displayName: room.name,
          category: `${building?.shortName || ''} - ${room.category || 'Room'}`,
        });
      }
    });
    
    // Add entrances
    nodes
      .filter((n) => n.type === 'ENTRANCE')
      .forEach((node) => {
        const building = buildings.find((b) => b.id === node.buildingId);
        locations.push({
          node,
          displayName: node.name,
          category: building?.shortName || 'Entrance',
        });
      });
    
    return locations;
  }, [nodes, rooms, buildings]);

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return searchableLocations;
    
    const query = searchQuery.toLowerCase();
    return searchableLocations.filter(
      (loc) =>
        loc.displayName.toLowerCase().includes(query) ||
        loc.category.toLowerCase().includes(query)
    );
  }, [searchableLocations, searchQuery]);

  // Get node by ID
  const getNodeById = useCallback(
    (id: string) => nodes.find((n) => n.id === id),
    [nodes]
  );

  // Get room by node ID
  const getRoomByNodeId = useCallback(
    (nodeId: string) => rooms.find((r) => r.nodeId === nodeId),
    [rooms]
  );

  // Get building by ID
  const getBuildingById = useCallback(
    (id: string) => buildings.find((b) => b.id === id),
    [buildings]
  );

  // Get nodes for current floor
  const nodesOnCurrentFloor = useMemo(
    () => nodes.filter((n) => n.floor === currentFloor || n.floor === 0),
    [nodes, currentFloor]
  );

  // Swap start and end
  const swapStartEnd = useCallback(() => {
    const tempStart = startNode;
    setStartNode(endNode);
    setEndNode(tempStart);
  }, [startNode, endNode, setStartNode, setEndNode]);

  return {
    // State
    nodes,
    buildings,
    rooms,
    startNode,
    endNode,
    currentPath,
    isCalculating,
    searchQuery,
    currentFloor,
    nodesOnCurrentFloor,
    
    // Computed
    searchableLocations,
    filteredLocations,
    
    // Actions
    setStartNode,
    setEndNode,
    clearPath,
    setSearchQuery,
    swapStartEnd,
    
    // Helpers
    getNodeById,
    getRoomByNodeId,
    getBuildingById,
  };
}
