import { useState } from "react";
import { Menu, X, Map, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminMode } from "@/hooks/useAdminMode";
import { EngineeringMap } from "@/components/Map/building/engineering-block/EngineeringMap";
import { AdminPanel } from "@/components/Admin/AdminPanel";
import { BlockNavigationPanel } from "@/components/navigation/BlockNavigationPanel";
import { useBlockNavigationStore } from "@/store/useBlockNavigationStore";

const EngineeringBlock = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAdminMode, setCurrentFloor, currentFloor } =
    useBlockNavigationStore();
  const { toggleAdminMode } = useAdminMode();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 z-30 relative">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden"
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
          {isAdminMode && (
            <span className="px-2 py-1 text-xs font-medium bg-warning/20 text-warning rounded-full">
              Admin Mode
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={toggleAdminMode}
            className="bg-card/90 backdrop-blur-sm shadow-md"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin Mode
          </Button>

          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>

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
            <BlockNavigationPanel />
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
          <AdminPanel />

          {/* Floor selector */}
          <div className="absolute top-40 left-2 z-50">
            <div className="backdrop-blur-md bg-slate-300 border border-white/10 rounded-xl p-2 shadow-lg">
              <p className="text-[10px] uppercase tracking-widest text-black text-center mb-2">
                Floor
              </p>

              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setCurrentFloor(floor)}
                    className={cn(
                      "w-12 h-10 text-sm font-semibold rounded-lg transition-all duration-200",
                      "flex items-center justify-center",
                      currentFloor === floor
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-white/90 text-black hover:bg-white",
                    )}
                  >
                    {floor === 0 ? "GF" : `F${floor}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-4 bottom-14 backdrop-blur-md bg-slate-300 border border-white/10 rounded-xl p-2">
            <div className="flex justify-between items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full" />
              <span>Entrance</span>
            </div>

            <div className="flex justify-between items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full" />
              <span>Room</span>
            </div>

            <div className="flex justify-between ">
              <div className="w-4 h-4 bg-yellow-500 rounded-full" />
              <span>Stairs</span>
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
        </main>
      </div>
    </div>
  );
};

export default EngineeringBlock;
