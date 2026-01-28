import React from 'react';
import { ArrowUpDown, X, Navigation } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { LocationSelector } from './LocationSelector';
import { InfoPanel } from './InfoPanel';

export function NavigationPanel() {
  const {
    startNode,
    endNode,
    currentPath,
    isCalculating,
    setStartNode,
    setEndNode,
    clearPath,
    swapStartEnd,
  } = useNavigation();

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Find Route</h2>
        </div>
        
        {(startNode || endNode) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearPath}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Location inputs */}
      <div className="relative flex flex-col gap-2">
        <LocationSelector
          type="start"
          selectedNode={startNode}
          onSelect={setStartNode}
          placeholder="Where are you now?"
        />
        
        {/* Swap button */}
        {(startNode || endNode) && (
          <button
            onClick={swapStartEnd}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
          >
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        
        <LocationSelector
          type="end"
          selectedNode={endNode}
          onSelect={setEndNode}
          placeholder="Where do you want to go?"
        />
      </div>

      {/* Info panel */}
      <InfoPanel
        path={currentPath}
        startNode={startNode}
        endNode={endNode}
        isCalculating={isCalculating}
      />
    </div>
  );
}
