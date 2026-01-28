import React, { useRef, useState, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useAdminMode } from "@/hooks/useAdminMode";
import { MapNode, Building } from "@/types/navigation";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PathOverlay } from "../../PathOverlay";
import { ConnectionLayer } from "../../ConnectionLayer";
import { NodeLayer } from "../../NodeLayer";
import { useBlockNavigation } from "@/hooks/useBlockNavigation";

interface MapCanvasProps {
  width?: number;
  height?: number;
}

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;

export function EngineeringMap({ width = 1000, height = 600 }: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const {
    nodes,
    startNode,
    endNode,
    currentPath,
    nodesOnCurrentFloor,
    setStartNode,
    setEndNode,
  } = useBlockNavigation();

  const {
    isAdminMode,
    selectedNode,
    isConnecting,
    connectionStart,
    selectNode,
    handleMapClick,
    createNodeAtPosition,
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
      console.log(Math.round(x), Math.round(y));

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

      createNodeAtPosition(x, y);
    },
    [isAdminMode, createNodeAtPosition],
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

  return (
    <div className="relative w-full h-full bg-map-background rounded-lg overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
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
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 650"
                onClick={onSvgClick}
                onDoubleClick={onSvgDoubleClick}
                ref={svgRef}
              >
                <defs>
                  <style>
                    {`
      .st0 { stroke-width: 1.61px; }
      .st0, .st1, .st2, .st3, .st4, .st5, .st6, .st7 {
        fill: none;
        stroke: #111111;
        stroke-miterlimit: 10;
      }
      .st1 { stroke-width: 1.23px; }
      .st2 { stroke-width: 1.31px; }
      .st3 { stroke-width: 8.34px; }
      .st4 { stroke-width: 8.38px; }
      .st5 { stroke-width: 1.48px; }
      .st6 { stroke-width: 1.43px; }
      .st7 { stroke-width: 1.39px; }
      `}
                  </style>
                </defs>

                <polyline
                  className="st3"
                  points="1046.48 151.98 1046.48 260.46 1089.26 260.46 1089.26 498.02 941.06 498.02 941.06 372.74 941.06 430.79 857.81 430.79 941.06 430.79 941.06 498.02 831.07 498.02 706.56 498.02 706.56 397.19 576.71 397.19 706.56 397.19 706.56 498.02 555.58 498.02 555.58 394.89 467.12 394.89 555.58 394.89 555.58 498.02 336.85 498.02 336.85 419.34 439.96 419.34 439.96 394.89 439.96 419.34 261.98 419.34 336.85 419.34 336.85 498.02 110.74 498.02 110.74 375.03 229.14 375.03 229.14 393.36 400.66 393.36 313.17 393.36 313.17 368.17 313.17 393.36 229.14 393.36 229.14 347.54 356.71 347.54 229.14 347.54 229.14 375.03 110.74 375.03 110.74 260.46 110.74 151.98 110.74 260.46 229.91 260.46 229.91 325.07 354.42 325.07 229.91 325.07 229.91 260.46 353.66 260.46 353.66 300.94 353.66 151.98"
                />

                <path className="st3" d="M834.67 393.11 L834.67 495.1" />

                <polyline
                  className="st3"
                  points="445.7 151.98 445.7 262.36 731 262.36 680.09 262.36 680.09 151.98 680.09 327.29 680.09 262.36 445.7 262.36 445.7 325 651.94 325 654.99 325"
                />

                <path className="st3" d="M720.69 334.55 L828.39 334.55" />

                <polyline
                  className="st3"
                  points="815.03 261.6 865.83 261.6 865.83 300.18 923.12 300.18 865.83 300.18 865.83 261.6 941.45 261.6 941.45 350.21 941.45 153.9 866.2 153.9 866.2 239.64"
                />

                <path className="st4" d="M106.5 151.98 L684.17 151.98" />

                <path
                  className="st1"
                  d="
    M353.66 260.46 L445.7 260.46
    M353.66 248.3  L445.7 248.3
    M353.66 236.15 L445.7 236.15
    M353.66 223.99 L445.7 223.99
    M353.66 211.83 L445.7 211.83
    M353.66 199.68 L445.7 199.68
    M353.66 187.52 L445.7 187.52
    M353.66 175.37 L445.7 175.37"
                />

                <path className="st7" d="M399.68 151.98 L399.68 260.45" />

                <path
                  className="st2"
                  d="
    M941.45 260.46 L1046.14 260.46
    M941.45 248.3  L1046.14 248.3
    M941.45 236.15 L1046.14 236.15
    M941.45 223.99 L1046.14 223.99
    M941.45 211.83 L1046.14 211.83
    M941.45 199.68 L1046.14 199.68
    M941.45 187.52 L1046.14 187.52
    M941.45 175.37 L1046.14 175.37"
                />

                <path className="st5" d="M993.8 151.98 L993.8 260.45" />

                <path
                  className="st6"
                  d="
    M834.67 394.17 L705.51 394.17
    M834.67 405.81 L705.51 405.81
    M834.67 417.45 L705.51 417.45
    M834.67 429.08 L705.51 429.08
    M834.67 440.72 L705.51 440.72
    M834.67 452.36 L705.51 452.36
    M834.67 463.99 L705.51 463.99
    M834.67 475.63 L705.51 475.63"
                />

                <path className="st0" d="M770.09 498.02 L770.09 394.17" />

                <path className="st3" d="M1050.61 153.9 L945.43 153.9" />
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
