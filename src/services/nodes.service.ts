import axios from "axios";
import { BaseUrl } from "./api";
import { MapNode, NodeType } from "@/types/navigation";

export const mapNodesService = {
  getMapNodes: async () => {
    const res = await axios.get(`${BaseUrl}/admin/nodes`);
    console.log("Map nodes response: ", res.data);
    return res.data;
  },

  createNode: async (data: {
    x: number;
    y: number;
    type: NodeType;
    name: string;
    buildingId: string;
  }) => {
    const res = await axios.post(`${BaseUrl}/admin/nodes/create-node`, data);
    console.log("Create nodes response: ", res.data);
    return res.data;
  },

  addConnections: async (payload: {
    weight: number;
    fromNodeId: string;
    toNodeId: string;
  }) => {
    const res = await axios.post(
      `${BaseUrl}/admin/nodes/add-connections`,
      payload,
    );
    console.log("Connection Response: ", res);
    return res.data;
  },

  deleteNode: async (nodeId: string) => {
    const res = await axios.delete(`${BaseUrl}/admin/nodes/${nodeId}`);
    console.log("Delete Node response: ", res);
    return res.data;
  },

  updateNode: async (node: MapNode) => {
    const res = await axios.put(
      `${BaseUrl}/admin/nodes/update-node/${node.id}`,
      node,
    );
    console.log("Update Node response: ", res);
    return res.data;
  },
};
