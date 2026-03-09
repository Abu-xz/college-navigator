import { updateNode } from "@/engine/graphUtils";
import { useBlockNavigation } from "@/hooks/useBlockNavigation";
import { useNavigation } from "@/hooks/useNavigation";
import { mapNodesService } from "@/services/nodes.service";
import { MapNode, NodeConnection, NodeType } from "@/types/navigation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Props = {
  node: MapNode;
  onClose: () => void;
  isBlock: boolean;
};

const NODE_TYPES: { type: NodeType; label: string; color: string }[] = [
  { type: "ROOM", label: "Room", color: "bg-primary" },
  { type: "WAYPOINT", label: "Waypoint", color: "bg-muted-foreground" },
  { type: "ENTRANCE", label: "Entrance", color: "bg-success" },
  { type: "STAIRS", label: "Stairs", color: "bg-warning" },
  { type: "ELEVATOR", label: "Elevator", color: "bg-accent" },
];

export default function EditNodeModal({ node, onClose, isBlock }: Props) {
  const [form, setForm] = useState<MapNode>({ ...node });

  const { fetchNodes } = useNavigation();
  const fetchBlockNodes = useBlockNavigation().fetchNodes;
  const currentFloor = useBlockNavigation().currentFloor;

  const updateField = (key: keyof MapNode, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateConnection = (
    index: number,
    key: keyof NodeConnection,
    value: unknown,
  ) => {
    const updated = [...form.connections];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, connections: updated });
  };

  const removeConnection = (index: number) => {
    const updated = form.connections.filter((_, i) => i !== index);
    setForm({ ...form, connections: updated });
  };

  const handleSave = async (data: MapNode) => {
    console.log("updated form: ", data);
    try {
      const res = await mapNodesService.updateNode(data);
      if (res.success) {
        toast(res.message);
        // Fetch updated Nodes;
        if (isBlock) {
          fetchBlockNodes(currentFloor);
        } else {
          fetchNodes();
        }
      }
    } catch (error) {
      console.log(error.response.data);
      toast("Unable to edit. Please try again");
    } finally {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Edit Node</h2>
          <p className="text-xs text-gray-500">{form.id}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              >
                {NODE_TYPES.map(({ type, label, color }) => (
                  <option value={type}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Floor</label>
              <input
                type="number"
                className="input"
                value={form.floor}
                onChange={(e) => updateField("floor", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="label">X</label>
              <input
                type="number"
                className="input"
                value={form.x}
                onChange={(e) => updateField("x", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="label">Y</label>
              <input
                type="number"
                className="input"
                value={form.y}
                onChange={(e) => updateField("y", Number(e.target.value))}
              />
            </div>
          </div>

          {/* Connections */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Connections</h3>
            </div>

            <div className="space-y-2">
              {form.connections.map((conn, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="input"
                    placeholder="Node ID"
                    value={conn.nodeId}
                    onChange={(e) =>
                      updateConnection(i, "nodeId", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="input w-24"
                    value={conn.weight}
                    onChange={(e) =>
                      updateConnection(i, "weight", Number(e.target.value))
                    }
                  />

                  <button
                    onClick={() => removeConnection(i)}
                    className="text-red-500 font-bold px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={() => handleSave(form)} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
