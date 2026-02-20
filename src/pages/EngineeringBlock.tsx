import { useEffect, useRef, useState } from "react";
import { Menu, X, Map, Info, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EngineeringMap } from "@/components/Map/building/engineering-block/EngineeringMap";
import { BlockNavigationPanel } from "@/components/navigation/BlockNavigationPanel";
import AboutModal from "@/components/AboutModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BlockAdminPanel } from "@/components/Admin/BlockAdminPanel";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useBlockNavigationStore } from "@/store/useBlockNavigationStore";
import { useAdminMode } from "@/hooks/useAdminMode";
import EditNodeModal from "@/components/EditNodeModal";
import { useBlockNavigation } from "@/hooks/useBlockNavigation";

const EngineeringBlock = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAdminMode, fetchNodes, currentFloor, setCurrentFloor } =
    useBlockNavigationStore();

  const { editingMode, setEditingMode } = useAdminMode();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const adminModeToggle = useNavigationStore().toggleAdminMode;
  const blockAdminModeToggle = useBlockNavigationStore().toggleAdminMode;
  const { setStartNode, setEndNode, nodes } = useBlockNavigation();

  const router = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const hasConsumedRef = useRef(false);

  useEffect(() => {
    if (hasConsumedRef.current) return;

    const fromNode = searchParams.get("fromNode");
    const toNode = searchParams.get("toNode");

    if (!fromNode || !toNode) return;

    const startNode = nodes.find((n) => n.id === fromNode);
    const endNode = nodes.find((n) => n.id === toNode);

    if (startNode && endNode) {
      setStartNode(startNode);
      setEndNode(endNode);

      hasConsumedRef.current = true;

      const params = new URLSearchParams(searchParams);
      params.delete("fromNode");
      params.delete("toNode");

      setSearchParams(params, { replace: true });
    }
  }, [nodes]);

  useEffect(() => {
    console.log("fetching nodes ");
    fetchNodes(currentFloor);
  }, [fetchNodes, currentFloor]);

  const handleAdminToggle = () => {
    adminModeToggle();
    blockAdminModeToggle();
  };

  const handleAdminLogin = () => {
    router("/admin/login");
  };

  const handleLogout = () => {
    setIsAboutOpen(false);
    handleAdminToggle();
    router("/");
  };

  // update nodes when floor changes
  const handleFloorChange = (floor: number) => {
    setCurrentFloor(floor);
    fetchNodes(currentFloor);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 z-30 relative">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-emerald-500/70 text-black"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Map className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">CampusNav</h1>
              <p className="text-xs text-muted-foreground">
                High-Precision Navigation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router("/")}
            className="bg-card/90 backdrop-blur-sm shadow-md"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAboutOpen(true)}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <AboutModal
        open={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        isAdminMode={isAdminMode}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-80 bg-card border-r border-border flex flex-col transition-all duration-300 z-20",
            "absolute lg:relative inset-y-0 left-0 top-14 lg:top-0",
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0",
          )}
        >
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            {isAdminMode ? <BlockAdminPanel /> : <BlockNavigationPanel />}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Map area */}
        <main className="flex-1 relative overflow-hidden">
          <EngineeringMap />

          {/* Floor selector */}
          <div className="absolute top-40 left-3 z-50">
            <div className="backdrop-blur-md bg-white/85 border border-black/10 rounded-xl px-3 py-2 shadow-lg">
              {/* Header */}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 text-center mb-2">
                Floor
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-1.5">
                {[0, 1, 2, 3].map((floor) => {
                  const isActive = currentFloor === floor;

                  return (
                    <button
                      key={floor}
                      onClick={() => handleFloorChange(floor)}
                      className={cn(
                        "w-12 h-9 rounded-lg text-xs font-semibold",
                        "flex items-center justify-center transition-all duration-200",
                        isActive
                          ? "bg-primary text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                      )}
                    >
                      {floor === 0 ? "GF" : `F${floor}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="absolute right-4 bottom-14 z-40 backdrop-blur-md bg-white/80 border border-black/10 rounded-xl px-3 py-2 shadow-lg">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 text-center mb-2">
              Legend
            </h3>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-green-600 rounded-full" />
                  <span className="text-xs font-medium text-gray-800">
                    Entrance
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-blue-600 rounded-full" />
                  <span className="text-xs font-medium text-gray-800">
                    Room
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-yellow-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-800">
                    Stairs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile toggle for sidebar */}
          {!isSidebarOpen && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-4 left-4 z-20 lg:hidden bg-card/90 backdrop-blur-sm shadow-md"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {editingMode && (
            <EditNodeModal
              node={editingMode}
              onClose={() => setEditingMode(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default EngineeringBlock;
