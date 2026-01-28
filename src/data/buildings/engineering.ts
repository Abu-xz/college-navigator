import { Building, MapNode, Room } from "@/types/navigation";

export const buildings: Building[] = [
  {
    id: "engineering",
    name: "Engineering Building",
    shortName: "ENG",
    floors: [1, 2, 3],
    color: "hsl(217, 91%, 50%)",
    bounds: { x: 415, y: 225, width: 120, height: 60 },
  },
];

// Initial nodes for the engineering map
export const initialNodes: MapNode[] = [
  {
    id: "entrance",
    type: "ENTRANCE",
    name: "Main Entrance",
    floor: 0,
    buildingId: "engineering",
    x: 750,
    y: 237,
    connections: [],
  },
  {
    id: "eng_101",
    type: "ROOM",
    name: "Main Entrance",
    floor: 0,
    buildingId: "engineering",
    x: 166,
    y: 186,
    connections: [],
  },
  {
    id: "eng_102",
    type: "STAIRS",
    name: "Main Entrance",
    floor: 0,
    buildingId: "engineering",
    x: 166,
    y: 186,
    connections: [],
  },
  {
    id: "eng_103",
    type: "WAYPOINT",
    name: "Main Entrance",
    floor: 0,
    buildingId: "engineering",
    x: 166,
    y: 186,
    connections: [],
  },
];

// Pre-computed connections
export const initialConnections: [string, string][] = [["entrance", "eng_101"]];

// Rooms list for search
export const rooms: Room[] = [
  {
    id: "room_eng_101",
    name: "ENG-101 - Intro to Programming",
    buildingId: "engineering",
    floor: 1,
    nodeId: "eng_101",
    category: "Classroom",
  },
  {
    id: "room_eng_102",
    name: "ENG-102 - Data Structures",
    buildingId: "engineering",
    floor: 1,
    nodeId: "eng_102",
    category: "Classroom",
  },
];
