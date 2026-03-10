import React, { useRef, useState, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { BuildingLayer } from "./BuildingLayer";
import { NodeLayer } from "./NodeLayer";
import { ConnectionLayer } from "./ConnectionLayer";
import { PathOverlay } from "./PathOverlay";
import { useNavigation } from "@/hooks/useNavigation";
import { useAdminMode } from "@/hooks/useAdminMode";
import { MapNode, Building } from "@/types/navigation";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapCanvasProps {
  width?: number;
  height?: number;
}

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;

export function MapCanvas({ width = 1000, height = 600 }: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const {
    nodes,
    buildings,
    startNode,
    endNode,
    currentPath,
    nodesOnCurrentFloor,
    setStartNode,
    setEndNode,
    loading,
  } = useNavigation();

  const {
    isAdminMode,
    selectedNode,
    isConnecting,
    connectionStart,
    selectNode,
    handleMapClick,
    createNodeAtPosition,
    newNodeType,
  } = useAdminMode();

  // Handle SVG click
  const onSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      console.log("triggered svg click");
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = SVG_WIDTH / rect.width;
      const scaleY = SVG_HEIGHT / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (isAdminMode) {
        handleMapClick(x, y, SVG_WIDTH, SVG_HEIGHT);
      }
    },
    [isAdminMode, handleMapClick],
  );

  // Handle double click to create node in admin mode
  const onSvgDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      console.log("triggered double click");
      if (!isAdminMode || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = SVG_WIDTH / rect.width;
      const scaleY = SVG_HEIGHT / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      createNodeAtPosition(x, y, newNodeType);
    },
    [isAdminMode, createNodeAtPosition, newNodeType],
  );

  // Handle node click
  const onNodeClick = useCallback(
    (node: MapNode) => {
      if (isAdminMode) {
        selectNode(node);
      } else {
        // In navigation mode, set as start or end
        if (!startNode) {
          setStartNode(node);
        } else if (!endNode) {
          setEndNode(node);
        } else {
          // Reset and set as new start
          setStartNode(node);
          setEndNode(null);
        }
      }
    },
    [isAdminMode, selectNode, startNode, endNode, setStartNode, setEndNode],
  );

  // Handle building click
  const onBuildingClick = useCallback(
    (building: Building) => {
      // Find the entrance of this building
      const entrance = nodes.find(
        (n) => n.buildingId === building.id && n.type === "ENTRANCE",
      );
      if (entrance && !isAdminMode) {
        if (!startNode) {
          setStartNode(entrance);
        } else if (!endNode) {
          setEndNode(entrance);
        }
      }
    },
    [nodes, isAdminMode, startNode, endNode, setStartNode, setEndNode],
  );

  if (loading)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-14 h-14 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Loading Text */}
        <p className="text-sm text-gray-500 tracking-wide">
          Loading map data...
        </p>
      </div>
    );

  return (
    <div className="relative w-full h-full bg-map-background rounded-lg overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        onTransformed={(_, state) => {
          setZoomLevel(state.scale);
        }}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => zoomIn()}
                className="bg-card/90 backdrop-blur-sm shadow-md"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => zoomOut()}
                className="bg-card/90 backdrop-blur-sm shadow-md"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => resetTransform()}
                className="bg-card/90 backdrop-blur-sm shadow-md"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute bottom-4 right-4 z-10 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground shadow-md">
              {Math.round(zoomLevel * 100)}%
            </div>

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className="w-full h-full"
                onClick={onSvgClick}
                onDoubleClick={onSvgDoubleClick}
                style={{
                  cursor: isAdminMode
                    ? isConnecting
                      ? "crosshair"
                      : "default"
                    : "grab",
                }}
              >
                {/* Background pattern */}
                <defs>
                  <pattern
                    id="grid"
                    width="50"
                    height="50"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                      opacity={0.5}
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Outdoor paths (decorative) */}
                <g className="outdoor-paths" opacity={0.3}>
                  <path
                    d="M 460 207 Q 493 207 551 210 Q 551 250 551 308"
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={20}
                    strokeLinecap="round"
                  />

                  <path
                    d="M 550 211 Q 778 207 945 206"
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={20}
                    strokeLinecap="round"
                  />

                  <path
                    d="M 490 308 Q 524 308 551 308 "
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={20}
                    strokeLinecap="round"
                  />

                  <path
                    d="M 248 249 L 348 123 L 461 118 Q 460 170 460 207 "
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={20}
                    strokeLinecap="round"
                  />
                  <path
                    d="M 83 214 L 82 168 L 83 128 Q 214 122 349 123 "
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={20}
                    strokeLinecap="round"
                  />
                  <path
                    d="M 798 209 C 656 210 666 210 664 79"
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={20}
                    strokeLinecap="round"
                  />
                </g>

                {/* Buildings */}
                <BuildingLayer
                  buildings={buildings}
                  hoveredBuilding={hoveredBuilding}
                  onBuildingHover={setHoveredBuilding}
                  onBuildingClick={onBuildingClick}
                />

                {/* Connections (admin mode shows them prominently) */}
                <ConnectionLayer
                  nodes={nodesOnCurrentFloor}
                  isAdminMode={isAdminMode}
                  selectedNodeId={selectedNode?.id}
                />

                {/* Path overlay */}
                {currentPath && <PathOverlay path={currentPath} />}

                {/* Nodes */}
                <NodeLayer
                  nodes={nodesOnCurrentFloor}
                  selectedNodeId={selectedNode?.id}
                  startNodeId={startNode?.id}
                  endNodeId={endNode?.id}
                  isAdminMode={isAdminMode}
                  isConnecting={isConnecting}
                  connectionStartId={connectionStart?.id}
                  onNodeClick={onNodeClick}
                  onNodeHover={setHoveredNode}
                  zoomLevel={zoomLevel}
                />

                {/* Connecting line preview */}
                {isConnecting && connectionStart && hoveredNode && (
                  <line
                    x1={connectionStart.x}
                    y1={connectionStart.y}
                    x2={hoveredNode.x}
                    y2={hoveredNode.y}
                    stroke="hsl(var(--accent))"
                    strokeWidth={20}
                    strokeDasharray="8,4"
                    pointerEvents="none"
                  />
                )}
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Hovered node tooltip */}
      {hoveredNode && !isAdminMode && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 map-panel px-4 py-2 animate-fade-in">
          <p className="text-sm font-medium">{hoveredNode.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {hoveredNode.type.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}
