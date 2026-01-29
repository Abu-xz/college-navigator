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

          {/* Floor selector */}
          <div className="flex gap-4 items-center justify-center">
            <p className="text-xs uppercase tracking-wide text-white bg-red-600 px-4 py-2 rounded">
              Select Floor
            </p>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((floor) => (
                <button
                  key={floor}
                  onClick={() => setCurrentFloor(floor)}
                  className={cn(
                    " px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    currentFloor === floor
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {floor === 0 ? "GF" : `F${floor}`}
                </button>
              ))}
            </div>
          </div>
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
